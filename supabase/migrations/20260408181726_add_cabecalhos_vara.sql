CREATE TABLE IF NOT EXISTS public.cabecalhos_vara (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vara TEXT NOT NULL,
    cidade TEXT,
    conteudo TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "authenticated_select_cabecalhos" ON public.cabecalhos_vara;
CREATE POLICY "authenticated_select_cabecalhos" ON public.cabecalhos_vara
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_cabecalhos" ON public.cabecalhos_vara;
CREATE POLICY "authenticated_insert_cabecalhos" ON public.cabecalhos_vara
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_update_cabecalhos" ON public.cabecalhos_vara;
CREATE POLICY "authenticated_update_cabecalhos" ON public.cabecalhos_vara
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_delete_cabecalhos" ON public.cabecalhos_vara;
CREATE POLICY "authenticated_delete_cabecalhos" ON public.cabecalhos_vara
  FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.cabecalhos_vara ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.historico_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pericia_id UUID NOT NULL REFERENCES public.pericias(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL,
    nome_documento TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "authenticated_select_historico" ON public.historico_documentos;
CREATE POLICY "authenticated_select_historico" ON public.historico_documentos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_historico" ON public.historico_documentos;
CREATE POLICY "authenticated_insert_historico" ON public.historico_documentos
  FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.historico_documentos ENABLE ROW LEVEL SECURITY;
