CREATE TABLE IF NOT EXISTS public.peticao_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.peticao_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_templates" ON public.peticao_templates;
CREATE POLICY "authenticated_select_templates" ON public.peticao_templates
  FOR SELECT TO authenticated USING (is_system = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_insert_templates" ON public.peticao_templates;
CREATE POLICY "authenticated_insert_templates" ON public.peticao_templates
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_update_templates" ON public.peticao_templates;
CREATE POLICY "authenticated_update_templates" ON public.peticao_templates
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_delete_templates" ON public.peticao_templates;
CREATE POLICY "authenticated_delete_templates" ON public.peticao_templates
  FOR DELETE TO authenticated USING (user_id = auth.uid());

INSERT INTO public.peticao_templates (id, nome, conteudo, is_system) VALUES
('b1a50b86-0b81-42df-9311-6df798544901'::uuid, 'Petição Pedido de Honorários', '[CABEÇALHO]

apresentar sua proposta de honorários periciais para a realização dos trabalhos técnicos necessários à lide.

Após detida análise dos autos e considerando a complexidade da matéria, o tempo estimado para as diligências, estudos, pesquisas e elaboração do laudo, estima-se o valor dos honorários periciais em [VALOR_HONORARIOS] [VALOR_EXTENSO].

Requer, outrossim, a intimação das partes para manifestação acerca da presente proposta e, havendo concordância, que seja determinado o depósito integral do valor para posterior início dos trabalhos.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544902'::uuid, 'Petição de Aceite', '[CABEÇALHO]

informar que ACEITA o encargo para o qual foi nomeado(a), comprometendo-se a cumprir o mister com zelo, dedicação e imparcialidade, entregando o laudo no prazo assinalado por este juízo.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544903'::uuid, 'Petição de Agendamento da Perícia', '[CABEÇALHO]

informar que a vistoria técnica necessária para a elaboração do laudo pericial foi agendada para o dia [DATA_PERICIA], a ser realizada no seguinte local: [ENDERECO_PERICIA].

Requer a intimação das partes e de seus respectivos assistentes técnicos para, querendo, acompanharem os trabalhos.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544904'::uuid, 'Petição de Recusa', '[CABEÇALHO]

informar que, por motivos de foro íntimo (ou incompatibilidade técnica/impedimento), RECUSA o encargo para o qual foi nomeado(a) nestes autos.

Requer a escusa do encargo e a nomeação de outro profissional para a realização dos trabalhos.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544905'::uuid, 'Petição Pedido de Documentação', '[CABEÇALHO]

informar que, para o regular andamento dos trabalhos periciais e elaboração do respectivo laudo, faz-se necessária a apresentação dos seguintes documentos pelas partes:

1. [ESPECIFIQUE OS DOCUMENTOS AQUI]

Requer a intimação das partes para que juntem aos autos os referidos documentos no prazo legal.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544906'::uuid, 'Petição de Liberação de Honorários Antecipado', '[CABEÇALHO]

requerer a liberação de 50% (cinquenta por cento) dos honorários periciais depositados, a título de adiantamento para custeio das despesas iniciais e diligências necessárias à realização da perícia.

Requer a expedição do competente alvará em favor deste(a) subscritor(a).

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544907'::uuid, 'Petição de Prorrogação de Prazo', '[CABEÇALHO]

requerer a PRORROGAÇÃO DO PRAZO para entrega do laudo pericial por mais 30 (trinta) dias, face à complexidade da matéria, à necessidade de diligências complementares e ao grande volume de documentos a serem analisados, o que impossibilita a conclusão dos trabalhos no prazo originalmente assinalado.

[RODAPE]', true),

('b1a50b86-0b81-42df-9311-6df798544908'::uuid, 'Petição de Liberação de Honorários', '[CABEÇALHO]

informar que os trabalhos periciais foram devidamente concluídos, com a apresentação do laudo conclusivo e eventuais esclarecimentos.

Requer, assim, a liberação do saldo remanescente dos honorários periciais depositados, com a expedição do competente alvará em favor deste(a) subscritor(a).

[RODAPE]', true)
ON CONFLICT (id) DO NOTHING;
