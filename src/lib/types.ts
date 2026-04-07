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

export type LancamentoTipo = 'receita' | 'despesa'
export type LancamentoStatus = 'pendente' | 'pago' | 'recebido'

export interface Lancamento {
  id: string
  data: string
  tipo: LancamentoTipo
  categoria: string
  descricao: string
  valor: number
  pericia_id?: string | null
  status: LancamentoStatus
  created_at?: string
  updated_at?: string
  pericia?: {
    id: string
    numero_processo: string
    vara: string
  }
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
