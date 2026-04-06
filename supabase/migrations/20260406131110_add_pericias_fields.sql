ALTER TABLE public.pericias
  ADD COLUMN IF NOT EXISTS justica_gratuita BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS perito_associado TEXT,
  ADD COLUMN IF NOT EXISTS descricao_impugnacao TEXT,
  ADD COLUMN IF NOT EXISTS data_impugnacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dias_impugnacao INTEGER,
  ADD COLUMN IF NOT EXISTS prazo_entrega TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS entrega_impugnacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS limites_esclarecimentos TEXT,
  ADD COLUMN IF NOT EXISTS entrega_esclarecimentos TIMESTAMPTZ;
