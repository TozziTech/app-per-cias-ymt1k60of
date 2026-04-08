ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS peticoes JSONB DEFAULT '[]'::jsonb;
