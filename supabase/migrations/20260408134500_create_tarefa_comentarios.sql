CREATE TABLE IF NOT EXISTS public.tarefa_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comentario TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tarefa_comentarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_tarefa_comentarios" ON public.tarefa_comentarios;
CREATE POLICY "authenticated_all_tarefa_comentarios" ON public.tarefa_comentarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
