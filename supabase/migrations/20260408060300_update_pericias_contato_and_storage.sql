DO $$
BEGIN
  -- Add the new column for linking to the contatos table
  ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS contato_perito_id UUID REFERENCES public.contatos(id) ON DELETE SET NULL;

  -- Ensure storage bucket exists for anexos
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('pericias_anexos', 'pericias_anexos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create policies for storage bucket
DROP POLICY IF EXISTS "public_read_anexos" ON storage.objects;
CREATE POLICY "public_read_anexos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "auth_insert_anexos" ON storage.objects;
CREATE POLICY "auth_insert_anexos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "auth_update_anexos" ON storage.objects;
CREATE POLICY "auth_update_anexos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'pericias_anexos');

DROP POLICY IF EXISTS "auth_delete_anexos" ON storage.objects;
CREATE POLICY "auth_delete_anexos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'pericias_anexos');
