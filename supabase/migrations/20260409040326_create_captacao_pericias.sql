CREATE TABLE IF NOT EXISTS public.captacao_pericias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_contato TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nome_contato TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  perito_id UUID REFERENCES public.peritos(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  telefone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  data_retorno TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.captacao_pericias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_captacao" ON public.captacao_pericias;
CREATE POLICY "authenticated_select_captacao" ON public.captacao_pericias
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_captacao" ON public.captacao_pericias;
CREATE POLICY "authenticated_insert_captacao" ON public.captacao_pericias
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_captacao" ON public.captacao_pericias;
CREATE POLICY "authenticated_update_captacao" ON public.captacao_pericias
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_captacao" ON public.captacao_pericias;
CREATE POLICY "authenticated_delete_captacao" ON public.captacao_pericias
  FOR DELETE TO authenticated USING (true);
