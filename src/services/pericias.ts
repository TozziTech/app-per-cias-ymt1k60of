import { supabase } from '@/lib/supabase/client'
import { Pericia } from '@/lib/types'

// Helper para converter de snake_case (DB) para camelCase (App)
function mapToApp(data: any): Pericia {
  return {
    ...data,
    codigoInterno: data.codigo_interno ?? data.codigoInterno ?? '',
    numeroProcesso: data.numero_processo ?? data.numeroProcesso ?? '',
    advogadoAutora: data.advogado_autora ?? data.advogadoAutora ?? '',
    advogadoRe: data.advogado_re ?? data.advogadoRe ?? '',
    assistenteTecnicoAutora: data.assistente_autora ?? data.assistenteTecnicoAutora ?? '',
    assistenteTecnicoRe: data.assistente_re ?? data.assistenteTecnicoRe ?? '',
    dataNomeacao: data.data_nomeacao ?? data.dataNomeacao ?? '',
    dataPericia: data.data_pericia ?? data.dataPericia ?? '',
    dataEntregaLaudo: data.data_entrega_laudo ?? data.dataEntregaLaudo ?? '',
    linkNuvem: data.link_nuvem ?? data.linkNuvem ?? '',
    justicaGratuita: data.justica_gratuita ?? data.justicaGratuita ?? false,
    peritoAssociado: data.perito_associado ?? data.peritoAssociado ?? '',
    descricaoImpugnacao: data.descricao_impugnacao ?? data.descricaoImpugnacao ?? '',
    dataImpugnacao: data.data_impugnacao ?? data.dataImpugnacao ?? '',
    diasImpugnacao: data.dias_impugnacao ?? data.diasImpugnacao,
    prazoEntrega: data.prazo_entrega ?? data.prazoEntrega ?? '',
    entregaImpugnacao: data.entrega_impugnacao ?? data.entregaImpugnacao ?? '',
    limitesEsclarecimentos: data.limites_esclarecimentos ?? data.limitesEsclarecimentos ?? '',
    entregaEsclarecimentos: data.entrega_esclarecimentos ?? data.entregaEsclarecimentos ?? '',
    statusPagamento: data.status_pagamento ?? data.statusPagamento ?? '',
    honorariosParcelados: data.honorarios_parcelados ?? data.honorariosParcelados ?? false,
    quantidadeParcelas: data.quantidade_parcelas ?? data.quantidadeParcelas,
    adiantamentoSolicitado: data.adiantamento_solicitado ?? data.adiantamentoSolicitado ?? false,
  } as Pericia
}

// Helper para converter de camelCase (App) para snake_case (DB)
function mapToDB(data: any): any {
  const mapped: any = { ...data }

  if ('codigoInterno' in data) {
    mapped.codigo_interno = data.codigoInterno
    delete mapped.codigoInterno
  }
  if ('numeroProcesso' in data) {
    mapped.numero_processo = data.numeroProcesso
    delete mapped.numeroProcesso
  }
  if ('advogadoAutora' in data) {
    mapped.advogado_autora = data.advogadoAutora
    delete mapped.advogadoAutora
  }
  if ('advogadoRe' in data) {
    mapped.advogado_re = data.advogadoRe
    delete mapped.advogadoRe
  }
  if ('assistenteTecnicoAutora' in data) {
    mapped.assistente_autora = data.assistenteTecnicoAutora
    delete mapped.assistenteTecnicoAutora
  }
  if ('assistenteTecnicoRe' in data) {
    mapped.assistente_re = data.assistenteTecnicoRe
    delete mapped.assistenteTecnicoRe
  }
  if ('dataNomeacao' in data) {
    mapped.data_nomeacao = data.dataNomeacao || null
    delete mapped.dataNomeacao
  }
  if ('dataPericia' in data) {
    mapped.data_pericia = data.dataPericia || null
    delete mapped.dataPericia
  }
  if ('dataEntregaLaudo' in data) {
    mapped.data_entrega_laudo = data.dataEntregaLaudo || null
    delete mapped.dataEntregaLaudo
  }
  if ('linkNuvem' in data) {
    mapped.link_nuvem = data.linkNuvem
    delete mapped.linkNuvem
  }
  if ('justicaGratuita' in data) {
    mapped.justica_gratuita = data.justicaGratuita
    delete mapped.justicaGratuita
  }
  if ('peritoAssociado' in data) {
    mapped.perito_associado = data.peritoAssociado
    delete mapped.peritoAssociado
  }
  if ('descricaoImpugnacao' in data) {
    mapped.descricao_impugnacao = data.descricaoImpugnacao
    delete mapped.descricaoImpugnacao
  }
  if ('dataImpugnacao' in data) {
    mapped.data_impugnacao = data.dataImpugnacao || null
    delete mapped.dataImpugnacao
  }
  if ('diasImpugnacao' in data) {
    mapped.dias_impugnacao = data.diasImpugnacao
    delete mapped.diasImpugnacao
  }
  if ('prazoEntrega' in data) {
    mapped.prazo_entrega = data.prazoEntrega || null
    delete mapped.prazoEntrega
  }
  if ('entregaImpugnacao' in data) {
    mapped.entrega_impugnacao = data.entregaImpugnacao || null
    delete mapped.entregaImpugnacao
  }
  if ('limitesEsclarecimentos' in data) {
    mapped.limites_esclarecimentos = data.limitesEsclarecimentos
    delete mapped.limitesEsclarecimentos
  }
  if ('entregaEsclarecimentos' in data) {
    mapped.entrega_esclarecimentos = data.entregaEsclarecimentos || null
    delete mapped.entregaEsclarecimentos
  }
  if ('statusPagamento' in data) {
    mapped.status_pagamento = data.statusPagamento
    delete mapped.statusPagamento
  }
  if ('honorariosParcelados' in data) {
    mapped.honorarios_parcelados = data.honorariosParcelados
    delete mapped.honorariosParcelados
  }
  if ('quantidadeParcelas' in data) {
    mapped.quantidade_parcelas = data.quantidadeParcelas
    delete mapped.quantidadeParcelas
  }
  if ('adiantamentoSolicitado' in data) {
    mapped.adiantamento_solicitado = data.adiantamentoSolicitado
    delete mapped.adiantamentoSolicitado
  }

  // Clean up any undefined values to avoid overriding defaults incorrectly
  Object.keys(mapped).forEach((key) => mapped[key] === undefined && delete mapped[key])

  return mapped
}

export async function getMyPericias(userId?: string): Promise<Pericia[]> {
  let query = supabase.from('pericias').select('*')

  if (userId) {
    query = query.eq('perito_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar minhas perícias:', error)
    throw error
  }

  return (data || []).map(mapToApp)
}

export async function getPericias(): Promise<Pericia[]> {
  const { data, error } = await supabase
    .from('pericias')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar perícias:', error)
    throw error
  }

  // Retorna apenas dados reais do Supabase, sem dados mockados.
  return (data || []).map(mapToApp)
}

export async function createPericia(pericia: Omit<Pericia, 'id'>): Promise<Pericia> {
  const dbPayload = mapToDB(pericia)
  const { data, error } = await supabase.from('pericias').insert([dbPayload]).select().single()

  if (error) {
    console.error('Erro ao criar perícia:', error)
    throw error
  }

  return mapToApp(data)
}

export async function updatePericia(id: string, updates: Partial<Pericia>): Promise<Pericia> {
  const dbPayload = mapToDB(updates)
  const { data, error } = await supabase
    .from('pericias')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar perícia:', error)
    throw error
  }

  return mapToApp(data)
}

export async function deletePericia(id: string): Promise<void> {
  const { error } = await supabase.from('pericias').delete().eq('id', id)

  if (error) {
    console.error('Erro ao excluir perícia:', error)
    throw error
  }
}

export async function uploadAnexo(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('anexos').upload(path, file)

  if (error) {
    console.error('Erro ao fazer upload do anexo:', error)
    throw error
  }

  return data.path
}

export async function deleteAnexo(path: string): Promise<void> {
  const { error } = await supabase.storage.from('anexos').remove([path])

  if (error) {
    console.error('Erro ao excluir anexo:', error)
    throw error
  }
}

export function getAnexoUrl(path: string): string {
  const { data } = supabase.storage.from('anexos').getPublicUrl(path)
  return data.publicUrl
}

export async function logActivity(
  periciaId: string,
  action: string,
  details?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from('activity_logs').insert([
    {
      entity_id: periciaId,
      entity_type: 'perícia',
      action,
      details: details ? { descricao: details } : null,
      user_id: user?.id || null,
    },
  ])

  if (error) {
    console.error('Erro ao registrar atividade:', error)
    throw error
  }
}

export async function getPericiaLogs(periciaId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_id', periciaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar logs da perícia:', error)
    throw error
  }

  return data || []
}
