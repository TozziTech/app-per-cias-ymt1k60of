import { supabase } from '@/lib/supabase/client'

export interface Mensagem {
  id: string
  pericia_id: string
  user_id: string
  mensagem: string
  created_at: string
  profiles?: {
    name: string
    avatar_url: string
  }
}

export const getMensagens = async (periciaId: string) => {
  const { data, error } = await supabase
    .from('pericia_mensagens')
    .select(`
      *,
      profiles:user_id(name, avatar_url)
    `)
    .eq('pericia_id', periciaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const sendMensagem = async (periciaId: string, userId: string, mensagem: string) => {
  const { data, error } = await supabase
    .from('pericia_mensagens')
    .insert({
      pericia_id: periciaId,
      user_id: userId,
      mensagem,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
