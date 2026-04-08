DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL DEFAULT 'Outros',
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.peritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    especialidade TEXT,
    status TEXT DEFAULT 'Ativo',
    data_inicio DATE DEFAULT CURRENT_DATE,
    orcamento_previsto NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS perito_id UUID REFERENCES public.peritos(id) ON DELETE SET NULL;
  ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS perito_id UUID REFERENCES public.peritos(id) ON DELETE SET NULL;
END $$;

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peritos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_contatos" ON public.contatos;
CREATE POLICY "authenticated_all_contatos" ON public.contatos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_peritos" ON public.peritos;
CREATE POLICY "authenticated_all_peritos" ON public.peritos FOR ALL TO authenticated USING (true) WITH CHECK (true);
