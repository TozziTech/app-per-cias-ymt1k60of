import { supabase } from '@/lib/supabase/client'

export interface Notificacao {
  id: string
  user_id: string
  titulo: string
  descricao: string | null
  link: string | null
  lida: boolean
  created_at: string
}

export const getNotificacoes = async () => {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data as Notificacao[]
}

export const markAsRead = async (id: string) => {
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id)

  if (error) throw error
}

export const markAllAsRead = async () => {
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)

  if (error) throw error
}

export const subscribeToNotificacoes = (userId: string, callback: () => void) => {
  return supabase
    .channel('notificacoes_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback()
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notificacoes',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        callback()
      },
    )
    .subscribe()
}
