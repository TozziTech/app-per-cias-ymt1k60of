DO $$
BEGIN
  -- Add new columns for personal, professional, contact and bank details
  ALTER TABLE public.peritos 
    ADD COLUMN IF NOT EXISTS cpf TEXT,
    ADD COLUMN IF NOT EXISTS rg TEXT,
    ADD COLUMN IF NOT EXISTS data_nascimento DATE,
    ADD COLUMN IF NOT EXISTS crea TEXT,
    ADD COLUMN IF NOT EXISTS telefone_alternativo TEXT,
    ADD COLUMN IF NOT EXISTS chave_pix TEXT,
    ADD COLUMN IF NOT EXISTS banco TEXT,
    ADD COLUMN IF NOT EXISTS agencia TEXT,
    ADD COLUMN IF NOT EXISTS conta TEXT,
    ADD COLUMN IF NOT EXISTS codigo_id TEXT,
    ADD COLUMN IF NOT EXISTS observacoes TEXT;
    
  -- Remove unused budget column as requested
  ALTER TABLE public.peritos DROP COLUMN IF EXISTS orcamento_previsto;
END $$;
