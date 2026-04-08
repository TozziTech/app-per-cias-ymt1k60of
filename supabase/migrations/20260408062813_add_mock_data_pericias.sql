DO $$
DECLARE
  v_perito_id_1 uuid := gen_random_uuid();
  v_perito_id_2 uuid := gen_random_uuid();
  v_pericia_id_1 uuid := gen_random_uuid();
  v_pericia_id_2 uuid := gen_random_uuid();
  v_pericia_id_3 uuid := gen_random_uuid();
BEGIN
  -- Insert mock peritos
  INSERT INTO public.peritos (id, nome, especialidade, endereco, email, status)
  VALUES 
    (v_perito_id_1, 'Eng. Carlos Andrade', 'Engenharia Civil', 'São Paulo, SP', 'carlos.andrade@exemplo.com', 'Ativo'),
    (v_perito_id_2, 'Dra. Fernanda Lima', 'Engenharia Elétrica', 'Campinas, SP', 'fernanda.lima@exemplo.com', 'Ativo')
  ON CONFLICT DO NOTHING;

  -- Insert mock pericias
  INSERT INTO public.pericias (
    id, 
    codigo_interno, 
    numero_processo, 
    vara, 
    cidade, 
    juiz, 
    perito_id, 
    perito_associado, 
    status, 
    data_nomeacao, 
    data_pericia,
    data_entrega_laudo,
    prazo_entrega,
    entrega_impugnacao,
    honorarios,
    justica_gratuita,
    observacoes
  )
  VALUES
    (
      v_pericia_id_1, 
      'PER-2023-001', 
      '1000123-45.2023.8.26.0000', 
      '1ª Vara Cível', 
      'São Paulo', 
      'Dr. Roberto Mendes', 
      v_perito_id_1, 
      'Eng. Carlos Andrade', 
      'Em Andamento', 
      NOW() - INTERVAL '30 days', 
      NOW() + INTERVAL '5 days',
      NOW() + INTERVAL '20 days',
      NULL,
      NULL,
      5000.00,
      false,
      'Agendada vistoria no local. Documentação inicial analisada.'
    ),
    (
      v_pericia_id_2, 
      'PER-2023-002', 
      '1000456-78.2023.8.26.0000', 
      '2ª Vara do Trabalho', 
      'Campinas', 
      'Dra. Ana Costa', 
      v_perito_id_2, 
      'Dra. Fernanda Lima', 
      'Agendado', 
      NOW() - INTERVAL '15 days', 
      NOW() + INTERVAL '10 days',
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '45 days',
      NULL,
      3500.00,
      true,
      'Aguardando entrega de quesitos complementares.'
    ),
    (
      v_pericia_id_3, 
      'PER-2023-003', 
      '1000789-12.2023.8.26.0000', 
      '3ª Vara Cível', 
      'Santos', 
      'Dr. João Pedro', 
      NULL, 
      NULL, 
      'Pendente', 
      NOW() - INTERVAL '5 days', 
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      false,
      'Nomeação recente. Aguardando aceite.'
    )
  ON CONFLICT DO NOTHING;
END $$;
