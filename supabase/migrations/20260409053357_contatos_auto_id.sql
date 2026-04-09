CREATE OR REPLACE FUNCTION public.generate_contato_codigo_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_seq int;
  v_last_code text;
  v_seq_str text;
BEGIN
  IF NEW.codigo_id IS NULL OR NEW.codigo_id = '' THEN
    -- Find the last generated code that matches CT-XXX
    SELECT codigo_id INTO v_last_code
    FROM public.contatos
    WHERE codigo_id ~ '^CT-\d+$'
    ORDER BY length(codigo_id) DESC, codigo_id DESC
    LIMIT 1;

    IF v_last_code IS NOT NULL THEN
      -- Extract the numeric sequence and increment
      v_seq_str := regexp_replace(v_last_code, '^CT-', '');
      v_seq := cast(v_seq_str as int) + 1;
    ELSE
      v_seq := 1;
    END IF;

    -- Format to CT-SEQ (ex: CT-001)
    NEW.codigo_id := 'CT-' || lpad(v_seq::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS set_contato_codigo_id ON public.contatos;
CREATE TRIGGER set_contato_codigo_id
  BEFORE INSERT ON public.contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_contato_codigo_id();
