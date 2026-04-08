ALTER TABLE public.pericias ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'Pendente';
