DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id UUID NOT NULL,
      details JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "authenticated_select_logs" ON public.activity_logs;
  CREATE POLICY "authenticated_select_logs" ON public.activity_logs
      FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "authenticated_insert_logs" ON public.activity_logs;
  CREATE POLICY "authenticated_insert_logs" ON public.activity_logs
      FOR INSERT TO authenticated WITH CHECK (true);
END $$;

CREATE OR REPLACE FUNCTION public.log_pericia_activity() RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'criou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo));
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if it's an actual update to avoid trigger spam
        IF NEW IS DISTINCT FROM OLD THEN
            INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
            VALUES (current_user_id, 'atualizou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo, 'status', NEW.status));
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'excluiu', 'perícia', OLD.id, jsonb_build_object('numero_processo', OLD.numero_processo));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS pericias_activity_trigger ON public.pericias;
CREATE TRIGGER pericias_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.pericias
    FOR EACH ROW EXECUTE FUNCTION public.log_pericia_activity();

CREATE OR REPLACE FUNCTION public.log_lancamento_activity() RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'criou', 'lançamento', NEW.id, jsonb_build_object('descricao', NEW.descricao, 'valor', NEW.valor));
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW IS DISTINCT FROM OLD THEN
            INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
            VALUES (current_user_id, 'atualizou', 'lançamento', NEW.id, jsonb_build_object('descricao', NEW.descricao, 'valor', NEW.valor));
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'excluiu', 'lançamento', OLD.id, jsonb_build_object('descricao', OLD.descricao, 'valor', OLD.valor));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS lancamentos_activity_trigger ON public.lancamentos;
CREATE TRIGGER lancamentos_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos
    FOR EACH ROW EXECUTE FUNCTION public.log_lancamento_activity();
