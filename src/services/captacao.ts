import pb from '@/lib/pocketbase/client'

export interface Captacao {
  id: string
  data_contato: string
  nome_contato: string
  instituicao: string
  perito_id: string | null
  responsavel_id: string | null
  telefone: string | null
  email: string | null
  status: string
  data_retorno: string | null
  observacoes: string | null
  created_at?: string
  updated_at?: string
  perito?: { nome: string } | null
}

export const getCaptacoes = async (): Promise<Captacao[]> => {
  const data = await pb.collection('captacao_pericias').getFullList({
    sort: '-data_contato',
    expand: 'perito_id',
  })

  return data.map((d) => ({
    ...d,
    perito: d.expand?.perito_id ? { nome: d.expand.perito_id.nome } : null,
    created_at: d.created,
    updated_at: d.updated,
  })) as any[]
}

export const createCaptacao = async (captacao: Partial<Captacao>) => {
  const data = await pb.collection('captacao_pericias').create(captacao)
  return data
}

export const updateCaptacao = async (id: string, captacao: Partial<Captacao>) => {
  const data = await pb.collection('captacao_pericias').update(id, captacao)
  return data
}

export const deleteCaptacao = async (id: string) => {
  await pb.collection('captacao_pericias').delete(id)
}
