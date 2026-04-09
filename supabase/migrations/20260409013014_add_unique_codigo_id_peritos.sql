DO $$
BEGIN
  -- Limpar duplicidades mantendo apenas o registro mais antigo com o codigo_id
  UPDATE public.peritos p1
  SET codigo_id = NULL
  WHERE p1.codigo_id IS NOT NULL AND p1.id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER(PARTITION BY codigo_id ORDER BY created_at ASC) as rn
      FROM public.peritos
      WHERE codigo_id IS NOT NULL
    ) sub WHERE rn = 1
  );
END $$;

ALTER TABLE public.peritos DROP CONSTRAINT IF EXISTS peritos_codigo_id_key;
ALTER TABLE public.peritos ADD CONSTRAINT peritos_codigo_id_key UNIQUE (codigo_id);
