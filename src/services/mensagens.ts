import pb from '@/lib/pocketbase/client'

export interface Mensagem {
  id: string
  pericia_id: string
  user_id: string
  mensagem: string
  tipo_mensagem?: string
  created_at: string
  profiles?: {
    name: string
    avatar_url: string
  }
}

export const getMensagens = async (periciaId: string) => {
  const data = await pb.collection('pericia_mensagens').getFullList({
    filter: `pericia_id = '${periciaId}'`,
    sort: 'created',
    expand: 'user_id',
  })

  return data.map((d: any) => ({
    ...d,
    created_at: d.created,
    profiles: d.expand?.user_id
      ? {
          name: d.expand.user_id.name,
          avatar_url: d.expand.user_id.avatar
            ? pb.files.getUrl(d.expand.user_id, d.expand.user_id.avatar)
            : '',
        }
      : null,
  }))
}

export const sendMensagem = async (
  periciaId: string,
  userId: string | null | undefined,
  mensagem: string,
  tipoMensagem?: 'usuario' | 'assistente',
) => {
  const data = await pb.collection('pericia_mensagens').create({
    pericia_id: periciaId,
    user_id: userId || null,
    mensagem,
    tipo_mensagem: tipoMensagem || (userId ? 'usuario' : 'assistente'),
  })
  return data
}
