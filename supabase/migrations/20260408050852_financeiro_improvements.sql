-- Categoria Table
DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.lancamento_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE public.lancamento_categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_categorias" ON public.lancamento_categorias;
CREATE POLICY "authenticated_select_categorias" ON public.lancamento_categorias FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_categorias" ON public.lancamento_categorias;
CREATE POLICY "authenticated_insert_categorias" ON public.lancamento_categorias FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.lancamento_categorias (nome, tipo) VALUES
  ('Honorários', 'receita'),
  ('Reembolso', 'receita'),
  ('Outras Receitas', 'receita'),
  ('Deslocamento', 'despesa'),
  ('Materiais', 'despesa'),
  ('Taxas', 'despesa'),
  ('Alimentação', 'despesa'),
  ('Outras Despesas', 'despesa')
ON CONFLICT DO NOTHING;

-- Lançamentos Columns
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS recorrente BOOLEAN DEFAULT false;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS frequencia_recorrencia TEXT;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS parcelas INTEGER;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS anexo_url TEXT;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS anexo_nome TEXT;

-- Storage Bucket for Attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('lancamentos', 'lancamentos', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to lancamentos" ON storage.objects;
CREATE POLICY "Public Access to lancamentos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'lancamentos');

DROP POLICY IF EXISTS "Authenticated Upload to lancamentos" ON storage.objects;
CREATE POLICY "Authenticated Upload to lancamentos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lancamentos');

DROP POLICY IF EXISTS "Authenticated Delete to lancamentos" ON storage.objects;
CREATE POLICY "Authenticated Delete to lancamentos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'lancamentos');
