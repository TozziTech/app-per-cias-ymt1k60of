CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    link TEXT,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificacoes_select_own" ON public.notificacoes;
CREATE POLICY "notificacoes_select_own" ON public.notificacoes
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notificacoes_update_own" ON public.notificacoes;
CREATE POLICY "notificacoes_update_own" ON public.notificacoes
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notificacoes_delete_own" ON public.notificacoes;
CREATE POLICY "notificacoes_delete_own" ON public.notificacoes
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notificacoes_insert_internal" ON public.notificacoes;
CREATE POLICY "notificacoes_insert_internal" ON public.notificacoes
    FOR INSERT TO authenticated WITH CHECK (true);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'notificacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  END IF;
END
$$;

-- Trigger for Task Status Change
CREATE OR REPLACE FUNCTION public.notify_tarefa_status_change()
RETURNS trigger AS $$
DECLARE
    v_creator_id UUID;
BEGIN
    v_creator_id := auth.uid();
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Notify responsavel if it's not them who changed
        IF NEW.responsavel_id IS NOT NULL AND NEW.responsavel_id != v_creator_id THEN
            INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
            VALUES (NEW.responsavel_id, 'Status da Tarefa Atualizado', 'A tarefa "' || NEW.titulo || '" mudou para ' || NEW.status, '/tarefas');
        END IF;
        
        -- Notify perito associado if it's not them who changed
        IF NEW.perito_associado_id IS NOT NULL AND NEW.perito_associado_id != v_creator_id THEN
            INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
            VALUES (NEW.perito_associado_id, 'Status da Tarefa Atualizado', 'A tarefa "' || NEW.titulo || '" mudou para ' || NEW.status, '/tarefas');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_tarefa_status_change ON public.tarefas;
CREATE TRIGGER trigger_notify_tarefa_status_change
    AFTER UPDATE ON public.tarefas
    FOR EACH ROW EXECUTE FUNCTION public.notify_tarefa_status_change();

-- Trigger for New Comment
CREATE OR REPLACE FUNCTION public.notify_tarefa_comentario()
RETURNS trigger AS $$
DECLARE
    v_responsavel_id UUID;
    v_perito_associado_id UUID;
    v_titulo TEXT;
BEGIN
    SELECT responsavel_id, perito_associado_id, titulo 
    INTO v_responsavel_id, v_perito_associado_id, v_titulo 
    FROM public.tarefas 
    WHERE id = NEW.tarefa_id;

    -- Notify responsavel if it's not them who commented
    IF v_responsavel_id IS NOT NULL AND v_responsavel_id != NEW.user_id THEN
        INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
        VALUES (v_responsavel_id, 'Novo Comentário', 'Novo comentário na tarefa "' || v_titulo || '"', '/tarefas');
    END IF;
    
    -- Notify perito associado if it's not them who commented
    IF v_perito_associado_id IS NOT NULL AND v_perito_associado_id != NEW.user_id THEN
        INSERT INTO public.notificacoes (user_id, titulo, descricao, link)
        VALUES (v_perito_associado_id, 'Novo Comentário', 'Novo comentário na tarefa "' || v_titulo || '"', '/tarefas');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_tarefa_comentario ON public.tarefa_comentarios;
CREATE TRIGGER trigger_notify_tarefa_comentario
    AFTER INSERT ON public.tarefa_comentarios
    FOR EACH ROW EXECUTE FUNCTION public.notify_tarefa_comentario();
