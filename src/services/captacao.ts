import { supabase } from '@/lib/supabase/client'

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
  created_at: string
  updated_at: string
  perito?: { nome: string } | null
}

export const getCaptacoes = async (): Promise<Captacao[]> => {
  const { data, error } = await supabase
    .from('captacao_pericias' as any)
    .select('*, perito:peritos(nome)')
    .order('data_contato', { ascending: false })

  if (error) throw error
  return data || []
}

export const createCaptacao = async (captacao: Partial<Captacao>) => {
  const { data, error } = await supabase
    .from('captacao_pericias' as any)
    .insert([captacao])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCaptacao = async (id: string, captacao: Partial<Captacao>) => {
  const { data, error } = await supabase
    .from('captacao_pericias' as any)
    .update(captacao)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCaptacao = async (id: string) => {
  const { error } = await supabase
    .from('captacao_pericias' as any)
    .delete()
    .eq('id', id)

  if (error) throw error
}
