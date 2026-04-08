DO $BODY$
BEGIN
    -- No schema changes needed, just replacing the function
END $BODY$;

CREATE OR REPLACE FUNCTION public.log_pericia_activity() RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    changed_fields JSONB;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'criou', 'perícia', NEW.id, jsonb_build_object('numero_processo', NEW.numero_processo));
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW IS DISTINCT FROM OLD THEN
            changed_fields := '{}'::jsonb;
            
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                changed_fields := changed_fields || jsonb_build_object('status', NEW.status, 'status_anterior', OLD.status);
            END IF;
            
            IF NEW.status_pagamento IS DISTINCT FROM OLD.status_pagamento THEN
                changed_fields := changed_fields || jsonb_build_object('status_pagamento', NEW.status_pagamento, 'status_pagamento_anterior', OLD.status_pagamento);
            END IF;

            IF NEW.perito_id IS DISTINCT FROM OLD.perito_id THEN
                changed_fields := changed_fields || jsonb_build_object('perito_id', 'Atualizado');
            END IF;

            IF NEW.checklist IS DISTINCT FROM OLD.checklist THEN
                changed_fields := changed_fields || jsonb_build_object('tarefas', 'Atualizadas');
            END IF;
            
            IF changed_fields = '{}'::jsonb THEN
                changed_fields := jsonb_build_object('atualizacao', 'geral');
            END IF;

            INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
            VALUES (current_user_id, 'atualizou', 'perícia', NEW.id, changed_fields);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (current_user_id, 'excluiu', 'perícia', OLD.id, jsonb_build_object('numero_processo', OLD.numero_processo));
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
