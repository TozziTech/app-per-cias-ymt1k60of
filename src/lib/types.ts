export type UserRole =
  | 'Administrador'
  | 'Gerente'
  | 'Perito Associado'
  | 'administrador'
  | 'engenheiro_perito'
  | 'user'

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
  responsavel_id?: string | null
  recorrente?: boolean
  frequencia_recorrencia?: string | null
  parcelas?: number | null
  anexo_url?: string | null
  anexo_nome?: string | null
  responsavel?: {
    id: string
    name: string
  } | null
}

export interface Tarefa {
  id: string
  titulo: string
  descricao?: string | null
  status: string
  pericia_id?: string | null
  responsavel_id?: string | null
  perito_associado_id?: string | null
  data_entrega?: string | null
  finalizado: boolean
  created_at: string
  updated_at?: string
  pericia?: {
    numero_processo: string
  } | null
  responsavel?: {
    name: string
  } | null
  perito?: {
    name: string
  } | null
}

export interface PericiaAnexo {
  id: string
  pericia_id: string
  file_name: string
  file_path: string
  content_type: string
  size: number
  created_at: string
  created_by?: string | null
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
  dataAceite?: string
  dataPericia: string
  dataEntregaLaudo: string
  honorarios?: number
  endereco?: string
  observacoes?: string
  linkNuvem?: string
  checklist: ChecklistItem[]
  peticoes?: ChecklistItem[]
  status: PericiaStatus
  justicaGratuita?: boolean
  peritoAssociado?: string
  perito_id?: string | null
  descricaoImpugnacao?: string
  dataImpugnacao?: string
  diasImpugnacao?: number
  prazoEntrega?: string
  entregaImpugnacao?: string
  limitesEsclarecimentos?: string
  entregaEsclarecimentos?: string
  anexos?: PericiaAnexo[]
  contato_perito_id?: string | null
  status_pagamento?: string
  statusPagamento?: string
  dataPagamento?: string
  honorariosParcelados?: boolean
  quantidadeParcelas?: number
  adiantamentoSolicitado?: boolean
  aceite?: string
  justificativa_recusa?: string
}
