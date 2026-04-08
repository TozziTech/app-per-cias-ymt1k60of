CREATE TABLE IF NOT EXISTS public.pericia_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pericia_id UUID NOT NULL REFERENCES public.pericias(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pericia_mensagens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_mensagens" ON public.pericia_mensagens;
CREATE POLICY "authenticated_all_mensagens" ON public.pericia_mensagens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pericia_mensagens;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
