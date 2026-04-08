-- Migration to create storage bucket "pericias_anexos"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pericias_anexos', 'pericias_anexos', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for pericias_anexos
DROP POLICY IF EXISTS "Authenticated users can upload pericias_anexos" ON storage.objects;
CREATE POLICY "Authenticated users can upload pericias_anexos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "Authenticated users can view pericias_anexos" ON storage.objects;
CREATE POLICY "Authenticated users can view pericias_anexos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "Authenticated users can delete pericias_anexos" ON storage.objects;
CREATE POLICY "Authenticated users can delete pericias_anexos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'pericias_anexos');
  
DROP POLICY IF EXISTS "Authenticated users can update pericias_anexos" ON storage.objects;
CREATE POLICY "Authenticated users can update pericias_anexos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'pericias_anexos');
