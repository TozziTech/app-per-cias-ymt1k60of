DO $$
BEGIN
  -- contatos updates para flexibilidade e novos campos solicitados
  ALTER TABLE public.contatos 
    ADD COLUMN IF NOT EXISTS telefone_celular TEXT,
    ADD COLUMN IF NOT EXISTS telefone_alternativo TEXT,
    ADD COLUMN IF NOT EXISTS codigo_id TEXT;
END $$;
