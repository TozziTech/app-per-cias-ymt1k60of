import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Menu,
  Paperclip,
  X,
  Trash2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import pb from '@/lib/pocketbase/client'
import {
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  createMessage,
  chatGemini,
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState<File | null>(null)

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
      console.warn('Silent fail loading conversations:', error)
      toast({
        variant: 'destructive',
        title: 'Aviso de Conexão',
        description: 'Não foi possível conectar ao servidor. O sistema continuará tentando.',
      })
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
        console.warn('Silent fail loading messages:', error)
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

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConv?.id === id) {
        setActiveConv(null)
        setMessages([])
      }
      toast({ description: 'Conversa excluída com sucesso.' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a conversa.',
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setAttachment(file)
      } else {
        toast({
          variant: 'destructive',
          title: 'Arquivo inválido',
          description: 'Apenas PDF e TXT são suportados.',
        })
      }
    }
  }

  const handleSend = async () => {
    if ((!inputValue.trim() && !attachment) || isSending) return

    let currentConv = activeConv
    if (!currentConv) {
      try {
        currentConv = await createConversation(
          inputValue.trim() ? inputValue.slice(0, 30) + '...' : 'Nova Análise',
        )
        setActiveConv(currentConv)
      } catch {
        toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao iniciar conversa.' })
        return
      }
    }

    const text = inputValue
    const currentAttachment = attachment
    setInputValue('')
    setAttachment(null)
    setIsSending(true)

    try {
      const userMessage = await createMessage(
        currentConv.id,
        text || 'Arquivo anexado.',
        'usuario',
        currentAttachment || undefined,
      )
      setMessages((prev) => {
        if (prev.some((m) => m.id === userMessage.id)) return prev
        return [...prev, userMessage]
      })
      await chatGemini(currentConv.id, text || 'Analise o arquivo em anexo e forneça um resumo.')
    } catch (error: any) {
      console.error('Erro no assistente:', error)
      const errorMessage =
        error?.response?.message || error?.message || 'Erro ao conectar ao serviço de IA.'
      toast({ variant: 'destructive', title: 'Erro de Comunicação', description: errorMessage })

      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        conversation: currentConv.id,
        user: 'system',
        content: `⚠️ **Aviso**: ${errorMessage}\n\nPor favor, tente novamente.`,
        type: 'assistente',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSending(false)
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
            <div
              key={conv.id}
              className={cn(
                'group flex items-center justify-between w-full rounded-lg transition-colors',
                activeConv?.id === conv.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground',
              )}
            >
              <button
                onClick={() => setActiveConv(conv)}
                className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left truncate"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate font-medium">{conv.title}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 mr-1 transition-opacity"
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                title="Excluir conversa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
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
      <div className="hidden md:flex w-64 shrink-0">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
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
                        Faça uma pergunta sobre perícias, inicie uma análise ou envie um documento
                        (PDF/TXT).
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
                              'px-4 py-3 rounded-2xl text-sm shadow-sm',
                              message.type === 'usuario'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none',
                            )}
                          >
                            {message.type === 'assistente' ? (
                              <MarkdownRenderer content={message.content} />
                            ) : (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            )}

                            {message.attachment && (
                              <a
                                href={pb.files.getUrl(message, message.attachment)}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  'flex items-center gap-2 mt-3 p-2 rounded-lg transition-colors w-fit border',
                                  message.type === 'usuario'
                                    ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                    : 'bg-background/50 hover:bg-background/80 border-border',
                                )}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs font-medium">Baixar Anexo</span>
                              </a>
                            )}
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

            <div className="p-3 bg-background border-t shrink-0 flex flex-col gap-2">
              {attachment && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm w-fit animate-fade-in">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px] font-medium">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setAttachment(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1.5 bottom-1.5 w-8 h-8 rounded-full text-muted-foreground hover:text-foreground z-10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="sr-only">Anexar arquivo</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Faça uma pergunta ou envie um documento..."
                  className="flex-1 min-h-[44px] rounded-full pl-11 pr-12 focus-visible:ring-primary/20 bg-muted/50 border-transparent focus-visible:border-primary/50"
                  disabled={isSending}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && !attachment) || isSending}
                  className="absolute right-1 bottom-1 w-9 h-9 rounded-full transition-transform active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
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
