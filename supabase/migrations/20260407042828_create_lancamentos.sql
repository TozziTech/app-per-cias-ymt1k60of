CREATE TABLE IF NOT EXISTS public.lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  pericia_id UUID REFERENCES public.pericias(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'recebido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "authenticated_select" ON public.lancamentos;
CREATE POLICY "authenticated_select" ON public.lancamentos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.lancamentos;
CREATE POLICY "authenticated_insert" ON public.lancamentos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.lancamentos;
CREATE POLICY "authenticated_update" ON public.lancamentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.lancamentos;
CREATE POLICY "authenticated_delete" ON public.lancamentos
  FOR DELETE TO authenticated USING (true);
