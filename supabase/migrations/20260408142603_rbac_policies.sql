-- Migration: Add RBAC policies for Financeiro, Tarefas and Profiles

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role IN ('Administrador', 'administrador', 'Gerente', 'Gestor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 2. Financeiro (lancamentos)
DROP POLICY IF EXISTS "authenticated_select" ON public.lancamentos;
DROP POLICY IF EXISTS "authenticated_select_lancamentos" ON public.lancamentos;
CREATE POLICY "authenticated_select_lancamentos" ON public.lancamentos
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    OR responsavel_id = auth.uid()
  );

DROP POLICY IF EXISTS "authenticated_insert" ON public.lancamentos;
DROP POLICY IF EXISTS "authenticated_insert_lancamentos" ON public.lancamentos;
CREATE POLICY "authenticated_insert_lancamentos" ON public.lancamentos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "authenticated_update" ON public.lancamentos;
DROP POLICY IF EXISTS "authenticated_update_lancamentos" ON public.lancamentos;
CREATE POLICY "authenticated_update_lancamentos" ON public.lancamentos
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "authenticated_delete" ON public.lancamentos;
DROP POLICY IF EXISTS "authenticated_delete_lancamentos" ON public.lancamentos;
CREATE POLICY "authenticated_delete_lancamentos" ON public.lancamentos
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Auditoria (activity_logs)
DROP POLICY IF EXISTS "authenticated_select_logs" ON public.activity_logs;
CREATE POLICY "authenticated_select_logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "authenticated_insert_logs" ON public.activity_logs;
CREATE POLICY "authenticated_insert_logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 4. Tarefas
DROP POLICY IF EXISTS "authenticated_all_tarefas" ON public.tarefas;

DROP POLICY IF EXISTS "tarefas_select" ON public.tarefas;
CREATE POLICY "tarefas_select" ON public.tarefas
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    OR perito_associado_id = auth.uid()
    OR responsavel_id = auth.uid()
  );

DROP POLICY IF EXISTS "tarefas_insert" ON public.tarefas;
CREATE POLICY "tarefas_insert" ON public.tarefas
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "tarefas_update" ON public.tarefas;
CREATE POLICY "tarefas_update" ON public.tarefas
  FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) 
    OR perito_associado_id = auth.uid()
    OR responsavel_id = auth.uid()
  );

DROP POLICY IF EXISTS "tarefas_delete" ON public.tarefas;
CREATE POLICY "tarefas_delete" ON public.tarefas
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

