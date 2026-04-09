ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS aceite TEXT DEFAULT 'Pendente';
ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS justificativa_recusa TEXT;
