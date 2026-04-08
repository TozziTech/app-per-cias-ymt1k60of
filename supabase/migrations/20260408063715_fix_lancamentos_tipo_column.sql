DO $$
BEGIN
  -- Drop the check constraint dependent on the column
  ALTER TABLE public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_tipo_check;

  -- Rename the column if it exists and the new one does not
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'lancamentos' AND column_name = 'Status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'lancamentos' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE public.lancamentos RENAME COLUMN "Status" TO tipo;
  END IF;

  -- Recreate the check constraint
  ALTER TABLE public.lancamentos DROP CONSTRAINT IF EXISTS lancamentos_tipo_check;
  ALTER TABLE public.lancamentos ADD CONSTRAINT lancamentos_tipo_check 
    CHECK (tipo = ANY (ARRAY['receita'::text, 'despesa'::text]));
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
