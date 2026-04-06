-- Ensures the pericias table exists to safely fetch calendar data
CREATE TABLE IF NOT EXISTS public.pericias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_interno TEXT,
  numero_processo TEXT,
  vara TEXT,
  cidade TEXT,
  data_nomeacao TIMESTAMPTZ,
  data_pericia TIMESTAMPTZ,
  data_entrega_laudo TIMESTAMPTZ,
  juiz TEXT,
  advogado_autora TEXT,
  advogado_re TEXT,
  assistente_autora TEXT,
  assistente_re TEXT,
  honorarios NUMERIC,
  endereco TEXT,
  observacoes TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  link_nuvem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pericias ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies
DROP POLICY IF EXISTS "authenticated_select" ON public.pericias;
CREATE POLICY "authenticated_select" ON public.pericias
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.pericias;
CREATE POLICY "authenticated_insert" ON public.pericias
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.pericias;
CREATE POLICY "authenticated_update" ON public.pericias
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.pericias;
CREATE POLICY "authenticated_delete" ON public.pericias
  FOR DELETE TO authenticated USING (true);
