import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Assistente() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
  }, [messages, isLoading])

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isLoading) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate network delay and possible error
    setTimeout(() => {
      // Simulate 10% chance of error
      if (Math.random() < 0.1) {
        setIsLoading(false)
        toast({
          variant: 'destructive',
          title: 'Erro na comunicação',
          description: 'Não foi possível obter uma resposta do assistente.',
          action: (
            <ToastAction altText="Tentar novamente" onClick={() => handleSend(text)}>
              Tentar novamente
            </ToastAction>
          ),
        })
        return
      }

      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Esta é uma resposta simulada para: "${text}". Sou seu assistente virtual e estou aqui para ajudar com suas dúvidas sobre perícias, laudos e procedimentos operacionais.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAssistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full mx-auto md:max-w-[600px] px-4 py-4 md:py-6">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Bot className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Assistente Gemini</h1>
      </div>

      <div className="flex-1 bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4 animate-fade-in-up">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    Olá! Sou seu assistente. Faça uma pergunta.
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    Estou aqui para ajudar com suas dúvidas sobre perícias, laudos e processos
                    operacionais.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full animate-fade-in-up',
                    message.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'flex gap-3 max-w-[85%]',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-auto',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex flex-col gap-1',
                        message.role === 'user' ? 'items-end' : 'items-start',
                      )}
                    >
                      <div
                        className={cn(
                          'px-4 py-2.5 rounded-2xl text-sm shadow-sm',
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none',
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
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
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1 bottom-1 w-9 h-9 rounded-full transition-transform active:scale-95"
            >
              {isLoading ? (
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
  )
}
