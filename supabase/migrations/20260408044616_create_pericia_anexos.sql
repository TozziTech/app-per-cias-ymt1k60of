-- Create table for pericia_anexos
CREATE TABLE IF NOT EXISTS public.pericia_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pericia_id UUID NOT NULL REFERENCES public.pericias(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pericia_anexos_pericia_id ON public.pericia_anexos(pericia_id);

-- RLS policies for pericia_anexos
ALTER TABLE public.pericia_anexos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_anexos" ON public.pericia_anexos;
CREATE POLICY "authenticated_select_anexos" ON public.pericia_anexos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_anexos" ON public.pericia_anexos;
CREATE POLICY "authenticated_insert_anexos" ON public.pericia_anexos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_anexos" ON public.pericia_anexos;
CREATE POLICY "authenticated_delete_anexos" ON public.pericia_anexos
  FOR DELETE TO authenticated USING (true);

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pericias_anexos', 'pericias_anexos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
DROP POLICY IF EXISTS "Allow authenticated selects to pericias_anexos" ON storage.objects;
CREATE POLICY "Allow authenticated selects to pericias_anexos" ON storage.objects 
  FOR SELECT TO authenticated USING (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "Allow authenticated uploads to pericias_anexos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to pericias_anexos" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "Allow authenticated deletes to pericias_anexos" ON storage.objects;
CREATE POLICY "Allow authenticated deletes to pericias_anexos" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'pericias_anexos');
