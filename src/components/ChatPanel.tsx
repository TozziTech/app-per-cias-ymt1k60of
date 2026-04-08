import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getMensagens, sendMensagem, Mensagem } from '@/services/mensagens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ChatPanel({
  periciaId,
  currentUserId,
}: {
  periciaId: string
  currentUserId: string
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMensagens()

    const channel = supabase
      .channel(`mensagens-${periciaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pericia_mensagens',
          filter: `pericia_id=eq.${periciaId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('pericia_mensagens')
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
  }, [periciaId])

  const fetchMensagens = async () => {
    try {
      const data = await getMensagens(periciaId)
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
    if (!newMessage.trim()) return

    const messageText = newMessage
    setNewMessage('')

    try {
      await sendMensagem(periciaId, currentUserId, messageText)
    } catch (error) {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' })
      setNewMessage(messageText)
    }
  }

  return (
    <div className="flex flex-col h-[50vh] min-h-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-4 text-sm text-zinc-500">
            Carregando mensagens...
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {mensagens.map((msg) => {
              const isMine = msg.user_id === currentUserId
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
                    {msg.mensagem}
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
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
