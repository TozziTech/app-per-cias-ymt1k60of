-- Function to auto-generate the codigo_interno column for public.pericias

CREATE OR REPLACE FUNCTION public.generate_codigo_interno()
RETURNS trigger AS $function$
DECLARE
  v_year text;
  v_seq int;
  v_last_code text;
  v_seq_str text;
BEGIN
  IF NEW.codigo_interno IS NULL OR NEW.codigo_interno = '' THEN
    v_year := to_char(CURRENT_DATE, 'YYYY');
    
    -- Find the last generated code for the current year
    SELECT codigo_interno INTO v_last_code
    FROM public.pericias
    WHERE codigo_interno ~ ('^PER-' || v_year || '-\d+$')
    ORDER BY length(codigo_interno) DESC, codigo_interno DESC
    LIMIT 1;

    IF v_last_code IS NOT NULL THEN
      -- Extract the numeric sequence and increment
      v_seq_str := regexp_replace(v_last_code, '^PER-\d{4}-', '');
      v_seq := cast(v_seq_str as int) + 1;
    ELSE
      v_seq := 1;
    END IF;

    -- Format to PER-YYYY-SEQ (ex: PER-2024-001)
    NEW.codigo_interno := 'PER-' || v_year || '-' || lpad(v_seq::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_codigo_interno ON public.pericias;

CREATE TRIGGER set_codigo_interno
  BEFORE INSERT ON public.pericias
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_codigo_interno();
