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
  const { error } = await supabase
    .from('pericia_logs')
    .insert([{ pericia_id: periciaId, action, details }])

  if (error) {
    console.error('Erro ao registrar atividade:', error)
    throw error
  }
}

export async function getPericiaLogs(periciaId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('pericia_logs')
    .select('*')
    .eq('pericia_id', periciaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar logs da perícia:', error)
    throw error
  }

  return data || []
}
