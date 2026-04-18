import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Plus, MessageSquare, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  getConversations,
  createConversation,
  getMessages,
  createMessage,
  type Conversation,
  type Message,
} from '@/services/assistente'
import { useRealtime } from '@/hooks/use-realtime'

export default function Assistente() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
      if (data.length > 0 && !activeConv) {
        setActiveConv(data[0])
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar conversas.' })
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useRealtime('conversations', () => {
    loadConversations()
  })

  useEffect(() => {
    if (!activeConv) return
    const loadMsgs = async () => {
      setIsLoadingMessages(true)
      try {
        const data = await getMessages(activeConv.id)
        setMessages(data)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao carregar mensagens.',
        })
      } finally {
        setIsLoadingMessages(false)
      }
    }
    loadMsgs()
  }, [activeConv])

  useRealtime('messages', (e) => {
    if (activeConv && e.record.conversation === activeConv.id) {
      if (e.action === 'create') {
        setMessages((prev) => {
          if (prev.some((m) => m.id === e.record.id)) return prev
          return [...prev, e.record as Message]
        })
      }
    }
  })

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
  }, [messages, isLoadingMessages, isSending])

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation('Nova Conversa')
      setConversations((prev) => [newConv, ...prev])
      setActiveConv(newConv)
      setMessages([])
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível criar a conversa.',
      })
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    let currentConv = activeConv
    if (!currentConv) {
      try {
        currentConv = await createConversation(inputValue.slice(0, 30) + '...')
        setActiveConv(currentConv)
      } catch {
        toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao iniciar conversa.' })
        return
      }
    }

    const text = inputValue
    setInputValue('')
    setIsSending(true)

    try {
      await createMessage(currentConv.id, text, 'usuario')

      // Simulate Assistant Response
      setTimeout(async () => {
        try {
          await createMessage(
            currentConv.id,
            `Esta é uma resposta simulada para: "${text}". Estou aqui para ajudar com perícias!`,
            'assistente',
          )
        } catch {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'O assistente falhou ao responder.',
          })
        } finally {
          setIsSending(false)
        }
      }, 1500)
    } catch (error) {
      setIsSending(false)
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao enviar mensagem.' })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-muted/30 border-r w-full">
      <div className="p-4 border-b">
        <Button onClick={handleNewConversation} className="w-full gap-2" variant="outline">
          <Plus className="w-4 h-4" /> Nova Conversa
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                activeConv?.id === conv.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground',
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{conv.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  if (isInitializing) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 shrink-0">
        <SidebarContent />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Sheet */}
        <div className="md:hidden flex items-center p-4 border-b gap-3 bg-card shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Bot className="w-5 h-5 text-primary" />
            Assistente Gemini
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center p-4 md:py-6 gap-3 shrink-0 mx-auto w-full max-w-3xl">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Assistente Gemini</h1>
        </div>

        <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto md:px-4 pb-4 min-h-0">
          <div className="flex-1 bg-card md:border md:rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-6 pb-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Olá! Sou seu assistente.</h3>
                      <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                        Faça uma pergunta sobre perícias ou inicie uma nova análise.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex w-full animate-fade-in-up',
                        message.type === 'usuario' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'flex gap-3 max-w-[85%]',
                          message.type === 'usuario' ? 'flex-row-reverse' : 'flex-row',
                        )}
                      >
                        <div
                          className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto',
                            message.type === 'usuario'
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {message.type === 'usuario' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'flex flex-col gap-1',
                            message.type === 'usuario' ? 'items-end' : 'items-start',
                          )}
                        >
                          <div
                            className={cn(
                              'px-4 py-2.5 rounded-2xl text-sm shadow-sm',
                              message.type === 'usuario'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none',
                            )}
                          >
                            {message.content}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {new Date(message.created).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isSending && (
                  <div className="flex w-full justify-start animate-fade-in-up">
                    <div className="flex gap-3 max-w-[85%] flex-row">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground mt-auto">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1 items-start">
                        <div className="px-4 py-4 rounded-2xl rounded-bl-none bg-zinc-100 dark:bg-zinc-800 flex items-center gap-1.5 shadow-sm">
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 bg-background border-t shrink-0">
              <div className="flex items-end gap-2 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Faça uma pergunta..."
                  className="flex-1 min-h-[44px] rounded-full pr-12 focus-visible:ring-primary/20"
                  disabled={isSending}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="absolute right-1 bottom-1 w-9 h-9 rounded-full transition-transform active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                  <span className="sr-only">Enviar mensagem</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
