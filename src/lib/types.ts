export type UserRole = 'administrador' | 'engenheiro_perito'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export type PericiaStatus =
  | 'Pendente'
  | 'Agendado'
  | 'Em Andamento'
  | 'Laudo Entregue'
  | 'Concluído'

export interface ChecklistItem {
  id: string
  texto: string
  concluido: boolean
}

export interface Pericia {
  id: string
  codigoInterno: string
  numeroProcesso: string
  juiz?: string
  advogadoAutora?: string
  advogadoRe?: string
  assistenteTecnicoAutora?: string
  assistenteTecnicoRe?: string
  vara: string
  cidade?: string
  dataNomeacao: string
  dataPericia: string
  dataEntregaLaudo: string
  honorarios?: number
  endereco?: string
  observacoes?: string
  linkNuvem?: string
  checklist: ChecklistItem[]
  status: PericiaStatus
  justicaGratuita?: boolean
  peritoAssociado?: string
  descricaoImpugnacao?: string
  dataImpugnacao?: string
  diasImpugnacao?: number
  prazoEntrega?: string
  entregaImpugnacao?: string
  limitesEsclarecimentos?: string
  entregaEsclarecimentos?: string
}
