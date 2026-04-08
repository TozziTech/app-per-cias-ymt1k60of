ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Create signatures bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for signatures bucket
DROP POLICY IF EXISTS "Public Access signatures" ON storage.objects;
CREATE POLICY "Public Access signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Auth Insert signatures" ON storage.objects;
CREATE POLICY "Auth Insert signatures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Auth Update signatures" ON storage.objects;
CREATE POLICY "Auth Update signatures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Auth Delete signatures" ON storage.objects;
CREATE POLICY "Auth Delete signatures" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'signatures');

-- Make sure avatars bucket exists with correct policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Auth Insert" ON storage.objects;
CREATE POLICY "Avatar Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Auth Update" ON storage.objects;
CREATE POLICY "Avatar Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Auth Delete" ON storage.objects;
CREATE POLICY "Avatar Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
