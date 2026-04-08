-- Adiciona colunas para anexos nos comentários de tarefas
ALTER TABLE public.tarefa_comentarios ADD COLUMN IF NOT EXISTS anexo_url TEXT;
ALTER TABLE public.tarefa_comentarios ADD COLUMN IF NOT EXISTS anexo_nome TEXT;

-- Atualiza a chave estrangeira de activity_logs para referenciar profiles e facilitar joins
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Cria o bucket de armazenamento para anexos de tarefas, se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tarefa_anexos', 'tarefa_anexos', true)
ON CONFLICT (id) DO NOTHING;

-- Remove políticas existentes para garantir idempotência
DROP POLICY IF EXISTS "tarefa_anexos_select" ON storage.objects;
DROP POLICY IF EXISTS "tarefa_anexos_insert" ON storage.objects;

-- Cria políticas de acesso para os anexos de tarefas
CREATE POLICY "tarefa_anexos_select" ON storage.objects 
  FOR SELECT USING (bucket_id = 'tarefa_anexos');

CREATE POLICY "tarefa_anexos_insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tarefa_anexos');

-- Garante política de leitura para a tabela de logs de auditoria
DROP POLICY IF EXISTS "authenticated_select_logs" ON public.activity_logs;
CREATE POLICY "authenticated_select_logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);
