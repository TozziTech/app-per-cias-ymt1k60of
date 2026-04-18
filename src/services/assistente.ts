import pb from '@/lib/pocketbase/client'

export interface Conversation {
  id: string
  user: string
  title: string
  created: string
  updated: string
}

export interface Message {
  id: string
  conversation: string
  user: string
  content: string
  type: 'usuario' | 'assistente'
  created: string
  updated: string
}

export const getConversations = async () => {
  return pb.collection('conversations').getFullList<Conversation>({
    sort: '-created',
  })
}

export const createConversation = async (title: string) => {
  return pb.collection('conversations').create<Conversation>({
    user: pb.authStore.record?.id,
    title,
  })
}

export const getMessages = async (conversationId: string) => {
  return pb.collection('messages').getFullList<Message>({
    filter: `conversation = "${conversationId}"`,
    sort: 'created',
  })
}

export const chatGemini = async (conversa_id: string, mensagem: string) => {
  return pb.send<{ data: { resposta: string } }>('/backend/v1/chat-gemini', {
    method: 'POST',
    body: JSON.stringify({ conversa_id, mensagem }),
  })
}
