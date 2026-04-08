-- Adicionar campos financeiros e de controle à tabela de pericias
ALTER TABLE public.pericias
ADD COLUMN IF NOT EXISTS honorarios_parcelados BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quantidade_parcelas INTEGER,
ADD COLUMN IF NOT EXISTS adiantamento_solicitado BOOLEAN DEFAULT false;

-- Inserir roles padrão na tabela de profiles caso não existam ou atualizar
-- Vamos permitir que o usuário gerencie os roles livremente pelo sistema
-- O padrão será 'Administrador' para garantir acesso ao primeiro usuário

-- Atualizar o trigger de novo usuário para definir Administrador como padrão se não informado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Administrador')
  );
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;
