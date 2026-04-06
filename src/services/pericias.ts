import { supabase } from '@/lib/supabase/client'
import { Pericia } from '@/lib/types'
import { Json } from '@/lib/supabase/types'

const mapToDb = (p: Partial<Pericia>) => {
  return {
    codigo_interno: p.codigoInterno,
    numero_processo: p.numeroProcesso,
    juiz: p.juiz,
    advogado_autora: p.advogadoAutora,
    advogado_re: p.advogadoRe,
    assistente_autora: p.assistenteTecnicoAutora,
    assistente_re: p.assistenteTecnicoRe,
    vara: p.vara,
    cidade: p.cidade,
    data_nomeacao: p.dataNomeacao || null,
    data_pericia: p.dataPericia || null,
    data_entrega_laudo: p.dataEntregaLaudo || null,
    honorarios: p.honorarios,
    endereco: p.endereco,
    observacoes: p.observacoes,
    link_nuvem: p.linkNuvem,
    checklist: (p.checklist as unknown as Json) || [],
    status: p.status,
    justica_gratuita: p.justicaGratuita,
    perito_associado: p.peritoAssociado,
    descricao_impugnacao: p.descricaoImpugnacao,
    data_impugnacao: p.dataImpugnacao || null,
    dias_impugnacao: p.diasImpugnacao,
    prazo_entrega: p.prazoEntrega || null,
    entrega_impugnacao: p.entregaImpugnacao || null,
    limites_esclarecimentos: p.limitesEsclarecimentos,
    entrega_esclarecimentos: p.entregaEsclarecimentos || null,
  }
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
  }
}

export const getPericias = async () => {
  const { data, error } = await supabase
    .from('pericias')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapFromDb)
}

export const createPericia = async (pericia: Omit<Pericia, 'id'>) => {
  const { data, error } = await supabase.from('pericias').insert(mapToDb(pericia)).select().single()

  if (error) throw error
  return mapFromDb(data)
}
