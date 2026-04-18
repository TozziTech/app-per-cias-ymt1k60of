import pb from '@/lib/pocketbase/client'

export interface Conversation {
  id: string
  title: string
  user: string
  created: string
  updated: string
}

export interface Message {
  id: string
  conversation: string
  user: string
  content: string
  type: 'usuario' | 'assistente'
  attachment?: string
  created: string
  updated: string
}

export const getConversations = async (): Promise<Conversation[]> => {
  return pb.collection('conversations').getFullList({ sort: '-created' })
}

export const createConversation = async (title: string): Promise<Conversation> => {
  const user = pb.authStore.record?.id
  return pb.collection('conversations').create({ title, user })
}

export const deleteConversation = async (id: string): Promise<void> => {
  return pb.collection('conversations').delete(id)
}

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  return pb
    .collection('messages')
    .getFullList({ filter: `conversation = "${conversationId}"`, sort: 'created' })
}

export const createMessage = async (
  conversationId: string,
  content: string,
  type: 'usuario' | 'assistente',
  attachment?: File,
): Promise<Message> => {
  const user = pb.authStore.record?.id
  const formData = new FormData()
  formData.append('conversation', conversationId)
  formData.append('content', content)
  formData.append('type', type)
  if (user) formData.append('user', user)
  if (attachment) formData.append('attachment', attachment)

  return pb.collection('messages').create(formData)
}

export const chatGemini = async (conversationId: string, message: string): Promise<any> => {
  const token = pb.authStore.token
  const url = pb.buildUrl('/backend/v1/chat/gemini')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ conversationId, message }),
    })

    if (!response.ok) {
      let errorMsg = 'Erro ao comunicar com o serviço de IA.'
      try {
        const data = await response.json()
        if (data.error) errorMsg = data.error
      } catch {
        // Ignora erro de parse se não for JSON
      }
      throw new Error(errorMsg)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Network or API Error in chatGemini:', error)
    throw new Error(error.message || 'Falha na conexão ou serviço indisponível.')
  }
}
