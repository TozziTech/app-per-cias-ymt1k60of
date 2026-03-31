export type UserRole = 'administrador' | 'engenheiro_perito'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export type PericiaStatus = 'Pendente' | 'Em Andamento' | 'Concluído'

export interface Pericia {
  id: string
  titulo: string
  descricao: string
  dataSolicitacao: string
  dataLimite: string
  responsavel: string
  status: PericiaStatus
}
