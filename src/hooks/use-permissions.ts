import { useAuth } from '@/contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role || 'user'

  const isAdmin = role === 'admin' || role === 'Administrador'
  const isManager = role === 'Gerente'
  const isPerito = role === 'Perito Associado' || role === 'engenheiro_perito'

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
