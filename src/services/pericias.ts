import { supabase } from '@/lib/supabase/client'
import { Pericia } from '@/lib/types'

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
  return (data || []) as any as Pericia[]
}

export async function createPericia(pericia: Omit<Pericia, 'id'>): Promise<Pericia> {
  const { data, error } = await supabase.from('pericias').insert([pericia]).select().single()

  if (error) {
    console.error('Erro ao criar perícia:', error)
    throw error
  }

  return data as any as Pericia
}

export async function updatePericia(id: string, updates: Partial<Pericia>): Promise<Pericia> {
  const { data, error } = await supabase
    .from('pericias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar perícia:', error)
    throw error
  }

  return data as any as Pericia
}

export async function deletePericia(id: string): Promise<void> {
  const { error } = await supabase.from('pericias').delete().eq('id', id)

  if (error) {
    console.error('Erro ao excluir perícia:', error)
    throw error
  }
}
