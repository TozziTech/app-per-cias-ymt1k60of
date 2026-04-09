DO $$
BEGIN
  ALTER TABLE public.peritos ADD COLUMN IF NOT EXISTS aceite TEXT DEFAULT 'Aceito';
  ALTER TABLE public.peritos ADD COLUMN IF NOT EXISTS justificativa_recusa TEXT;
END $$;
