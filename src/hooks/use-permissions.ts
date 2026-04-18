import { useAuth } from '@/contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role || 'user'

  const isAdmin =
    role === 'admin' || role === 'Administrador' || user?.email === 'tozziengenharia@hotmail.com'
  const isManager = role === 'gerente' || role === 'Gerente'
  const isPerito = role === 'perito' || role === 'Perito Associado' || role === 'engenheiro_perito'
  const isAssistente = role === 'assistente'

  const canEditFinanceiro = isAdmin || isManager
  const canDelete = isAdmin
  const canManageUsers = isAdmin

  return {
    isAdmin,
    isManager,
    isPerito,
    canEditFinanceiro,
    canDelete,
    canManageUsers,
    role,
  }
}
