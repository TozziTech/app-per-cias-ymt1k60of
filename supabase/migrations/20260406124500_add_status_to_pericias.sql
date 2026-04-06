-- Adicionar coluna status na tabela pericias
ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Agendado';
