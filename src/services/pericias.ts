import { supabase } from '@/lib/supabase/client'
import { Pericia, PericiaAnexo } from '@/lib/types'
import { Json } from '@/lib/supabase/types'

const mapToDb = (p: Partial<Pericia>) => {
  const db: any = {}
  if (p.codigoInterno !== undefined) db.codigo_interno = p.codigoInterno
  if (p.numeroProcesso !== undefined) db.numero_processo = p.numeroProcesso
  if (p.juiz !== undefined) db.juiz = p.juiz
  if (p.advogadoAutora !== undefined) db.advogado_autora = p.advogadoAutora
  if (p.advogadoRe !== undefined) db.advogado_re = p.advogadoRe
  if (p.assistenteTecnicoAutora !== undefined) db.assistente_autora = p.assistenteTecnicoAutora
  if (p.assistenteTecnicoRe !== undefined) db.assistente_re = p.assistenteTecnicoRe
  if (p.vara !== undefined) db.vara = p.vara
  if (p.cidade !== undefined) db.cidade = p.cidade
  if (p.dataNomeacao !== undefined) db.data_nomeacao = p.dataNomeacao || null
  if (p.dataPericia !== undefined) db.data_pericia = p.dataPericia || null
  if (p.dataEntregaLaudo !== undefined) db.data_entrega_laudo = p.dataEntregaLaudo || null
  if (p.honorarios !== undefined) db.honorarios = p.honorarios
  if (p.endereco !== undefined) db.endereco = p.endereco
  if (p.observacoes !== undefined) db.observacoes = p.observacoes
  if (p.linkNuvem !== undefined) db.link_nuvem = p.linkNuvem
  if (p.checklist !== undefined) db.checklist = (p.checklist as unknown as Json) || []
  if (p.status !== undefined) db.status = p.status
  if (p.justicaGratuita !== undefined) db.justica_gratuita = p.justicaGratuita
  if (p.peritoAssociado !== undefined) db.perito_associado = p.peritoAssociado
  if (p.descricaoImpugnacao !== undefined) db.descricao_impugnacao = p.descricaoImpugnacao
  if (p.dataImpugnacao !== undefined) db.data_impugnacao = p.dataImpugnacao || null
  if (p.diasImpugnacao !== undefined) db.dias_impugnacao = p.diasImpugnacao
  if (p.prazoEntrega !== undefined) db.prazo_entrega = p.prazoEntrega || null
  if (p.entregaImpugnacao !== undefined) db.entrega_impugnacao = p.entregaImpugnacao || null
  if (p.limitesEsclarecimentos !== undefined) db.limites_esclarecimentos = p.limitesEsclarecimentos
  if (p.entregaEsclarecimentos !== undefined)
    db.entrega_esclarecimentos = p.entregaEsclarecimentos || null
  if (p.perito_id !== undefined) db.perito_id = p.perito_id || null
  if (p.contato_perito_id !== undefined) db.contato_perito_id = p.contato_perito_id || null
  return db
}

const mapFromDb = (row: any): Pericia => {
  return {
    id: row.id,
    codigoInterno: row.codigo_interno || '',
    numeroProcesso: row.numero_processo || '',
    juiz: row.juiz || '',
    advogadoAutora: row.advogado_autora || '',
    advogadoRe: row.advogado_re || '',
    assistenteTecnicoAutora: row.assistente_autora || '',
    assistenteTecnicoRe: row.assistente_re || '',
    vara: row.vara || '',
    cidade: row.cidade || '',
    dataNomeacao: row.data_nomeacao || '',
    dataPericia: row.data_pericia || '',
    dataEntregaLaudo: row.data_entrega_laudo || '',
    honorarios: row.honorarios || undefined,
    endereco: row.endereco || '',
    observacoes: row.observacoes || '',
    linkNuvem: row.link_nuvem || '',
    checklist: (row.checklist || []) as any,
    status: row.status as any,
    justicaGratuita: row.justica_gratuita || false,
    peritoAssociado: row.perito_associado || '',
    descricaoImpugnacao: row.descricao_impugnacao || '',
    dataImpugnacao: row.data_impugnacao || '',
    diasImpugnacao: row.dias_impugnacao || undefined,
    prazoEntrega: row.prazo_entrega || '',
    entregaImpugnacao: row.entrega_impugnacao || '',
    limitesEsclarecimentos: row.limites_esclarecimentos || '',
    entregaEsclarecimentos: row.entrega_esclarecimentos || '',
    perito_id: row.perito_id || null,
    contato_perito_id: row.contato_perito_id || null,
    anexos: row.pericia_anexos || [],
  }
}

export const getPericias = async () => {
  const { data, error } = await supabase
    .from('pericias')
    .select('*, pericia_anexos(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapFromDb)
}

export const getPericiaAnexos = async (periciaId: string) => {
  const { data, error } = await supabase
    .from('pericia_anexos')
    .select('*')
    .eq('pericia_id', periciaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as PericiaAnexo[]
}

export const logActivity = async (
  action: string,
  entityType: string,
  entityId: string,
  details: any,
  userId?: string,
) => {
  const { error } = await supabase.from('activity_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    user_id: userId || null,
  })
  if (error) console.error('Error logging activity', error)
}

export const getPericiaLogs = async (periciaId: string) => {
  const { data: logs, error: logsError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('entity_id', periciaId)
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  if (!logs.length) return []

  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[]

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)

    const profileMap = (profiles || []).reduce(
      (acc, p) => {
        acc[p.id] = p
        return acc
      },
      {} as Record<string, any>,
    )

    return logs.map((l) => ({
      ...l,
      user: l.user_id ? profileMap[l.user_id] : null,
    }))
  }

  return logs.map((l) => ({ ...l, user: null }))
}

export const uploadAnexo = async (periciaId: string, file: File, userId?: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${periciaId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('pericias_anexos')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('pericia_anexos')
    .insert({
      pericia_id: periciaId,
      file_name: file.name,
      file_path: filePath,
      content_type: file.type,
      size: file.size,
      created_by: userId || null,
    })
    .select()
    .single()

  if (dbError) throw dbError

  await logActivity(
    'upload',
    'documento',
    periciaId,
    { anexo_id: data.id, file_name: file.name },
    userId,
  )

  return data as PericiaAnexo
}

export const deleteAnexo = async (
  anexoId: string,
  filePath: string,
  periciaId?: string,
  fileName?: string,
  userId?: string,
) => {
  const { error: storageError } = await supabase.storage.from('pericias_anexos').remove([filePath])

  if (storageError) throw storageError

  const { error: dbError } = await supabase.from('pericia_anexos').delete().eq('id', anexoId)

  if (dbError) throw dbError

  if (periciaId && fileName) {
    await logActivity(
      'excluiu',
      'documento',
      periciaId,
      { anexo_id: anexoId, file_name: fileName },
      userId,
    )
  }
}

export const getAnexoUrl = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from('pericias_anexos')
    .createSignedUrl(filePath, 3600) // 1 hour

  if (error) throw error
  return data.signedUrl
}

export const createPericia = async (pericia: Omit<Pericia, 'id'>) => {
  const { data, error } = await supabase.from('pericias').insert(mapToDb(pericia)).select().single()

  if (error) throw error
  return mapFromDb(data)
}

export const updatePericia = async (id: string, pericia: Partial<Pericia>) => {
  const { data, error } = await supabase
    .from('pericias')
    .update(mapToDb(pericia))
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapFromDb(data)
}
