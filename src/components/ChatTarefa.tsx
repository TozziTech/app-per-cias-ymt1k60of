import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Paperclip } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Mensagem {
  id: string
  tarefa_id: string
  user_id: string
  comentario: string
  created_at: string
  anexo_url?: string | null
  anexo_nome?: string | null
  profiles?: {
    name: string
    avatar_url: string
  }
}

export function ChatTarefa({ tarefaId }: { tarefaId: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id || null)
    })
  }, [])

  useEffect(() => {
    if (!currentUserId) return

    fetchMensagens()

    const channel = supabase
      .channel(`tarefa_comentarios-${tarefaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tarefa_comentarios',
          filter: `tarefa_id=eq.${tarefaId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('tarefa_comentarios')
            .select('*, profiles:user_id(name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMensagens((prev) => {
              if (prev.find((m) => m.id === data.id)) return prev
              return [...prev, data as Mensagem]
            })
            scrollToBottom()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tarefaId, currentUserId])

  const fetchMensagens = async () => {
    try {
      const { data, error } = await supabase
        .from('tarefa_comentarios')
        .select('*, profiles:user_id(name, avatar_url)')
        .eq('tarefa_id', tarefaId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMensagens(data as Mensagem[])
      scrollToBottom()
    } catch (error) {
      toast({ title: 'Erro ao carregar mensagens', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() || !currentUserId || uploading) return

    const messageText = newMessage
    setNewMessage('')

    try {
      const { error } = await supabase.from('tarefa_comentarios').insert({
        tarefa_id: tarefaId,
        user_id: currentUserId,
        comentario: messageText,
      })
      if (error) throw error
    } catch (error) {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' })
      setNewMessage(messageText)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `${tarefaId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('tarefa_anexos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('tarefa_anexos').getPublicUrl(filePath)

      const { error } = await supabase.from('tarefa_comentarios').insert({
        tarefa_id: tarefaId,
        user_id: currentUserId,
        comentario: newMessage.trim() || 'Arquivo anexado',
        anexo_url: publicUrl,
        anexo_nome: file.name,
      })

      if (error) throw error
      setNewMessage('')
    } catch (error: any) {
      toast({ title: 'Erro ao enviar anexo', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col h-[50vh] min-h-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Nenhum comentário ainda. Inicie a conversa!
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {mensagens.map((msg) => {
              const isMine = msg.user_id === currentUserId
              const isImage = msg.anexo_url && msg.anexo_url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!isMine && (
                      <div className="text-xs font-medium text-zinc-500">
                        {msg.profiles?.name || 'Usuário'}
                      </div>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] p-3 text-sm shadow-sm ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm'
                    }`}
                  >
                    {msg.comentario}
                    {msg.anexo_url && (
                      <div className="mt-2">
                        {isImage ? (
                          <a href={msg.anexo_url} target="_blank" rel="noreferrer">
                            <img
                              src={msg.anexo_url}
                              alt={msg.anexo_nome || 'Anexo'}
                              className="max-w-[240px] rounded-md border border-black/10 dark:border-white/10"
                            />
                          </a>
                        ) : (
                          <a
                            href={msg.anexo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-md hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                          >
                            <Paperclip className="h-4 w-4 shrink-0" />
                            <span className="text-xs font-medium truncate max-w-[180px]">
                              {msg.anexo_nome || 'Baixar Arquivo'}
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Anexar arquivo"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite seu comentário..."
            className="flex-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            disabled={uploading}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={uploading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
