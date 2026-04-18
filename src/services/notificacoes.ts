import pb from '@/lib/pocketbase/client'

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
  if (!pb.authStore.record?.id) return []

  const data = await pb.collection('notificacoes').getFullList({
    filter: `user_id = '${pb.authStore.record.id}'`,
    sort: '-created',
    limit: 50,
  })

  return data.map((d) => ({
    ...d,
    created_at: d.created,
  })) as Notificacao[]
}

export const markAsRead = async (id: string) => {
  await pb.collection('notificacoes').update(id, { lida: true })
}

export const markAllAsRead = async () => {
  if (!pb.authStore.record?.id) return
  const unread = await pb.collection('notificacoes').getFullList({
    filter: `user_id = '${pb.authStore.record.id}' && lida = false`,
  })

  for (const n of unread) {
    await pb.collection('notificacoes').update(n.id, { lida: true })
  }
}
