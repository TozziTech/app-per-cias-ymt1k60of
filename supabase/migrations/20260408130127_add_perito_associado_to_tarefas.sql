ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS perito_associado_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
