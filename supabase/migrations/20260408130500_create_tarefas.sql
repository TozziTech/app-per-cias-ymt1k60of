CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'Pendente',
  pericia_id UUID REFERENCES public.pericias(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_entrega TIMESTAMPTZ,
  finalizado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_tarefas" ON public.tarefas;
CREATE POLICY "authenticated_all_tarefas" ON public.tarefas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  v_pericia_id uuid;
  v_responsavel_id uuid;
  v_tarefa_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  SELECT id INTO v_pericia_id FROM public.pericias LIMIT 1;
  SELECT id INTO v_responsavel_id FROM auth.users LIMIT 1;

  IF v_pericia_id IS NOT NULL AND v_responsavel_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.tarefas WHERE id = v_tarefa_id) THEN
      INSERT INTO public.tarefas (id, titulo, descricao, status, pericia_id, responsavel_id, data_entrega, finalizado)
      VALUES (
        v_tarefa_id,
        'Revisar Laudo Preliminar',
        'Analisar a documentação anexada ao processo para emissão do laudo.',
        'Em Andamento',
        v_pericia_id,
        v_responsavel_id,
        NOW() + INTERVAL '7 days',
        false
      );
    END IF;
  END IF;
END $$;
