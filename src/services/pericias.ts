import pb from '@/lib/pocketbase/client'
import { Pericia } from '@/lib/types'

function mapToApp(data: any): Pericia {
  const anexos =
    data.expand?.anexos_pericia_via_pericia_id?.map((a: any) => ({
      id: a.id,
      pericia_id: a.pericia_id,
      file_name: a.file_name,
      file_path: pb.files.getUrl(a, a.file),
      size: a.size,
      created_at: a.created,
      created_by: a.created_by,
      tipo_documento: a.tipo_documento,
    })) || []

  return {
    ...data,
    codigoInterno: data.codigo_interno || '',
    numeroProcesso: data.numero_processo || '',
    vara: data.vara || '',
    cidade: data.cidade || '',
    tipoAcao: data.tipo_acao || '',
    parteAutora: data.parte_autora || '',
    parteRe: data.parte_re || '',
    advogadoAutora: data.advogado_autora || '',
    advogadoRe: data.advogado_re || '',
    assistenteTecnicoAutora: data.assistente_autora || '',
    assistenteTecnicoRe: data.assistente_re || '',
    assistenteTecnico: data.assistente_tecnico || '',
    peritoAnterior: data.perito_anterior || '',
    valorPropostoAnterior: data.valor_proposto_anterior || null,
    valorHomologado: data.valor_homologado || null,
    enderecoObjeto: data.endereco_objeto || '',
    resumoObjeto: data.resumo_objeto || '',
    dataNomeacao: data.data_nomeacao || '',
    dataAceite: data.data_aceite || '',
    dataPericia: data.data_pericia || '',
    dataEntregaLaudo: data.data_entrega_laudo || '',
    linkNuvem: data.link_nuvem || '',
    justicaGratuita: data.justica_gratuita || false,
    peritoAssociado: data.perito_associado || '',
    descricaoImpugnacao: data.descricao_impugnacao || '',
    dataImpugnacao: data.data_impugnacao || '',
    diasImpugnacao: data.dias_impugnacao,
    prazoEntrega: data.prazo_entrega || '',
    entregaImpugnacao: data.entrega_impugnacao || '',
    limitesEsclarecimentos: data.limites_esclarecimentos || '',
    entregaEsclarecimentos: data.entrega_esclarecimentos || '',
    statusPagamento: data.status_pagamento || '',
    dataPagamento: data.data_pagamento || '',
    honorariosParcelados: data.honorarios_parcelados || false,
    quantidadeParcelas: data.quantidade_parcelas,
    adiantamentoSolicitado: data.adiantamento_solicitado || false,
    created_at: data.created,
    updated_at: data.updated,
    checklist: data.checklist || [],
    peticoes: data.peticoes || [],
    anexos,
  } as any
}

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
  if ('vara' in data) {
    mapped.vara = data.vara
    delete mapped.vara
  }
  if ('cidade' in data) {
    mapped.cidade = data.cidade
    delete mapped.cidade
  }
  if ('tipoAcao' in data) {
    mapped.tipo_acao = data.tipoAcao
    delete mapped.tipoAcao
  }
  if ('parteAutora' in data) {
    mapped.parte_autora = data.parteAutora
    delete mapped.parteAutora
  }
  if ('parteRe' in data) {
    mapped.parte_re = data.parteRe
    delete mapped.parteRe
  }
  if ('assistenteTecnico' in data) {
    mapped.assistente_tecnico = data.assistenteTecnico
    delete mapped.assistenteTecnico
  }
  if ('peritoAnterior' in data) {
    mapped.perito_anterior = data.peritoAnterior
    delete mapped.peritoAnterior
  }
  if ('valorPropostoAnterior' in data) {
    mapped.valor_proposto_anterior = data.valorPropostoAnterior
    delete mapped.valorPropostoAnterior
  }
  if ('valorHomologado' in data) {
    mapped.valor_homologado = data.valorHomologado
    delete mapped.valorHomologado
  }
  if ('enderecoObjeto' in data) {
    mapped.endereco_objeto = data.enderecoObjeto
    delete mapped.enderecoObjeto
  }
  if ('resumoObjeto' in data) {
    mapped.resumo_objeto = data.resumoObjeto
    delete mapped.resumoObjeto
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
  if ('dataAceite' in data) {
    mapped.data_aceite = data.dataAceite || null
    delete mapped.dataAceite
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
  if ('dataPagamento' in data) {
    mapped.data_pagamento = data.dataPagamento || null
    delete mapped.dataPagamento
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

  delete mapped.created_at
  delete mapped.updated_at
  delete mapped.anexos

  Object.keys(mapped).forEach((key) => mapped[key] === undefined && delete mapped[key])
  return mapped
}

export async function getMyPericias(userId?: string): Promise<Pericia[]> {
  const filter = userId ? `perito_id = '${userId}' || assistentes ~ '${userId}'` : ''
  const data = await pb
    .collection('pericias')
    .getFullList({ filter, sort: '-created', expand: 'anexos_pericia_via_pericia_id' })
  return data.map(mapToApp)
}

export async function getPericias(): Promise<Pericia[]> {
  const data = await pb
    .collection('pericias')
    .getFullList({ sort: '-created', expand: 'anexos_pericia_via_pericia_id' })
  return data.map(mapToApp)
}

export async function createPericia(pericia: Omit<Pericia, 'id'>): Promise<Pericia> {
  const dbPayload = mapToDB(pericia)
  const data = await pb.collection('pericias').create(dbPayload)
  return mapToApp(data)
}

export async function updatePericia(id: string, updates: Partial<Pericia>): Promise<Pericia> {
  const dbPayload = mapToDB(updates)
  const data = await pb.collection('pericias').update(id, dbPayload)
  return mapToApp(data)
}

export async function deletePericia(id: string): Promise<void> {
  await pb.collection('pericias').delete(id)
}

export async function uploadAnexo(
  periciaId: string,
  file: File,
  userId?: string,
  tipoDocumento?: string,
): Promise<any> {
  const formData = new FormData()
  formData.append('pericia_id', periciaId)
  formData.append('file', file)
  formData.append('file_name', file.name)
  formData.append('size', file.size.toString())
  if (userId) formData.append('created_by', userId)
  if (tipoDocumento) formData.append('tipo_documento', tipoDocumento)

  const data = await pb.collection('anexos_pericia').create(formData)
  return {
    id: data.id,
    pericia_id: data.pericia_id,
    file_name: data.file_name,
    file_path: pb.files.getUrl(data, data.file),
    size: data.size,
    created_at: data.created,
    created_by: data.created_by,
    tipo_documento: data.tipo_documento,
  }
}

export async function deleteAnexo(
  anexoId: string,
  filePath: string,
  periciaId: string,
  fileName: string,
  userId?: string,
): Promise<void> {
  await pb.collection('anexos_pericia').delete(anexoId)
}

export async function getAnexoUrl(filePath: string): Promise<string> {
  return filePath
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  details?: any,
  userId?: string,
): Promise<void> {
  await pb.collection('activity_logs').create({
    entity_id: entityId,
    entity_type: entityType,
    action,
    details,
    user_id: userId || pb.authStore.record?.id,
  })
}

export async function getPericiaLogs(periciaId: string): Promise<any[]> {
  const data = await pb.collection('activity_logs').getFullList({
    filter: `entity_id = '${periciaId}'`,
    sort: '-created',
    expand: 'user_id',
  })
  return data.map((r) => ({
    ...r,
    user: r.expand?.user_id ? { name: r.expand.user_id.name, email: r.expand.user_id.email } : null,
  }))
}
