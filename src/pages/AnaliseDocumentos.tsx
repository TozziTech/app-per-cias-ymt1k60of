import { useState, useEffect, useRef } from 'react'
import { getMyPericias, uploadAnexo } from '@/services/pericias'
import { getMensagens, sendMensagem } from '@/services/mensagens'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import { ChatSidebar } from '@/components/analise/ChatSidebar'
import { ChatMessage } from '@/components/analise/ChatMessage'
import { ChatInput } from '@/components/analise/ChatInput'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, MessageSquare, AlertCircle, ChevronDown, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function AnaliseDocumentos() {
  const { user, signOut } = useAuth()
  const [pericias, setPericias] = useState<any[]>([])
  const [selectedPericia, setSelectedPericia] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingPericias, setLoadingPericias] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    loadPericias()
  }, [])

  useEffect(() => {
    if (selectedPericia) {
      loadMessages(selectedPericia.id)
      setIsSheetOpen(false)
    }
  }, [selectedPericia])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useRealtime('pericia_mensagens', () => {
    if (selectedPericia) {
      loadMessages(selectedPericia.id, false)
    }
  })

  const loadPericias = async () => {
    setLoadingPericias(true)
    try {
      const data = await getMyPericias(user?.id)
      setPericias(data)
    } catch (err) {
      toast.error('Erro ao carregar perícias.')
    } finally {
      setLoadingPericias(false)
    }
  }

  const loadMessages = async (id: string, showLoading = true) => {
    if (showLoading) setLoadingMessages(true)
    setError(false)
    try {
      const msgs = await getMensagens(id)
      if (msgs.length === 0) {
        // Create initial greeting to fulfill acceptance criteria
        const greeting = 'Olá, sou seu assistente de análise. Anexe um PDF para começar.'
        await sendMensagem(id, null, greeting)
        const updatedMsgs = await getMensagens(id)
        setMessages(updatedMsgs)
      } else {
        setMessages(msgs)
      }
    } catch (err) {
      setError(true)
    } finally {
      if (showLoading) setLoadingMessages(false)
    }
  }

  const handleSend = async (text: string, file?: File | null) => {
    if (!selectedPericia) return
    setIsSending(true)
    try {
      let finalMsg = text
      if (file) {
        if (user?.id) {
          await uploadAnexo(selectedPericia.id, file, user.id)
        }
        finalMsg = `[Arquivo anexado: ${file.name}]\n${text}`
      }

      await sendMensagem(selectedPericia.id, user?.id, finalMsg)

      // Mock assistant reply after 1.5s
      setTimeout(async () => {
        const reply = file
          ? 'Recebi o documento. Estou analisando o conteúdo para extrair as informações relevantes...'
          : 'Entendido. Como posso ajudar com este caso?'
        await sendMensagem(selectedPericia.id, null, reply)
      }, 1500)
    } catch (err) {
      toast.error('Erro ao enviar mensagem.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden w-[280px] shrink-0 md:block">
        <ChatSidebar
          pericias={pericias}
          selectedId={selectedPericia?.id}
          onSelect={setSelectedPericia}
          loading={loadingPericias}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <ChatSidebar
                  pericias={pericias}
                  selectedId={selectedPericia?.id}
                  onSelect={setSelectedPericia}
                  loading={loadingPericias}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                AP
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Análise de Perícias
              </h1>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 gap-2 px-3 hover:bg-accent/50">
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                  {user?.name || user?.email || 'Usuário'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6">
          {!selectedPericia ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground animate-in fade-in duration-500">
              <div className="rounded-full bg-muted p-6">
                <MessageSquare className="h-12 w-12 opacity-50" />
              </div>
              <p className="text-lg font-medium">Selecione uma perícia para começar</p>
            </div>
          ) : loadingMessages ? (
            <div className="flex flex-col gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex w-full gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 shrink-0 rounded-full" />}
                  <Skeleton className="h-16 w-2/3 rounded-2xl" />
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 shrink-0 rounded-full" />}
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-destructive">
              <AlertCircle className="h-10 w-10" />
              <p className="font-medium">Erro ao carregar dados. Tente novamente.</p>
              <Button
                onClick={() => loadMessages(selectedPericia.id)}
                variant="outline"
                className="h-11"
              >
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>

        {/* Chat Footer Input */}
        <ChatInput onSend={handleSend} isSending={isSending} disabled={!selectedPericia} />
      </div>
    </div>
  )
}
