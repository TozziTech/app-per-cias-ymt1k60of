import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMyPericias, uploadAnexo, createPericia } from '@/services/pericias'
import { getMensagens, sendMensagem, sendChatGemini } from '@/services/mensagens'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime } from '@/hooks/use-realtime'
import { ChatSidebar } from '@/components/analise/ChatSidebar'
import { ChatMessage } from '@/components/analise/ChatMessage'
import { ChatInput } from '@/components/analise/ChatInput'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  LogOut,
  CalendarIcon,
  Loader2,
  Paperclip,
  FileText,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

const newPericiaSchema = z.object({
  numeroProcesso: z.string().min(1, 'Número do processo é obrigatório'),
  vara: z.string().optional(),
  cidade: z.string().optional(),
  dataPericia: z.date().optional(),
})

function AnexosList({ pericia }: { pericia: any }) {
  if (!pericia?.anexos || pericia.anexos.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">Nenhum anexo encontrado.</div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {pericia.anexos.map((anexo: any) => (
        <div key={anexo.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{anexo.file_name}</span>
            <span className="text-xs text-muted-foreground">
              {(anexo.size / 1024).toFixed(1)} KB
            </span>
          </div>
          <a
            href={anexo.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  )
}

export default function AnaliseDocumentos() {
  const { user, signOut } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const periciaIdParam = searchParams.get('pericia_id')

  const [pericias, setPericias] = useState<any[]>([])
  const [selectedPericia, setSelectedPericia] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingPericias, setLoadingPericias] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAnexosSheetOpen, setIsAnexosSheetOpen] = useState(false)

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof newPericiaSchema>>({
    resolver: zodResolver(newPericiaSchema),
    defaultValues: {
      numeroProcesso: '',
    },
  })

  useEffect(() => {
    loadPericias()
  }, [])

  useEffect(() => {
    if (pericias.length > 0 && periciaIdParam) {
      const p = pericias.find((p) => p.id === periciaIdParam)
      if (p && (!selectedPericia || selectedPericia.id !== p.id)) {
        setSelectedPericia(p)
      }
    }
  }, [pericias, periciaIdParam])

  useEffect(() => {
    if (selectedPericia) {
      loadMessages(selectedPericia.id)
      setIsSheetOpen(false)
    }
  }, [selectedPericia])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useRealtime('pericia_mensagens', (e) => {
    if (selectedPericia && e.record.pericia_id === selectedPericia.id) {
      loadMessages(selectedPericia.id, false)
    }
  })

  useRealtime('anexos_pericia', (e) => {
    if (selectedPericia && e.record.pericia_id === selectedPericia.id) {
      loadPericias()
    }
  })

  const handleSelectPericia = (p: any) => {
    setSelectedPericia(p)
    setSearchParams({ pericia_id: p.id })
    setIsSheetOpen(false)
  }

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
        const greeting = 'Olá, sou seu assistente de análise. Anexe um PDF para começar.'
        await sendMensagem(id, null, greeting, 'assistente')
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

      await sendMensagem(selectedPericia.id, user?.id, finalMsg, 'usuario')

      try {
        const response = await sendChatGemini(selectedPericia.id, finalMsg)
        const replyText =
          response?.reply ||
          response?.text ||
          response?.mensagem ||
          response?.response ||
          (typeof response === 'string' ? response : null)

        if (replyText) {
          await sendMensagem(selectedPericia.id, null, replyText, 'assistente')
        }
      } catch (aiError) {
        toast.error('O assistente está indisponível no momento')
        console.error(aiError)
      }
    } catch (err) {
      toast.error('Falha ao enviar arquivo ou mensagem')
    } finally {
      setIsSending(false)
    }
  }

  const onSubmitNewPericia = async (values: z.infer<typeof newPericiaSchema>) => {
    try {
      const payload = {
        numeroProcesso: values.numeroProcesso,
        vara: values.vara,
        cidade: values.cidade,
        dataPericia: values.dataPericia ? format(values.dataPericia, 'yyyy-MM-dd') : undefined,
        status: 'Pendente',
        perito_id: user?.id,
      } as any

      const newPericia = await createPericia(payload)

      toast.success('Perícia criada com sucesso!')
      setIsNewDialogOpen(false)
      form.reset()

      setPericias((prev) => [newPericia, ...prev])
      setSelectedPericia(newPericia)
    } catch (err: any) {
      toast.error('Erro ao criar nova perícia. Tente novamente.')

      try {
        await pb.collection('error_logs').create({
          user: user?.id,
          form_id: 'nova_pericia_analise',
          error_type: err.message || 'Unknown error',
        })
      } catch (logErr) {
        console.error('Failed to log error', logErr)
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden w-[280px] shrink-0 md:block">
        <ChatSidebar
          pericias={pericias}
          selectedId={selectedPericia?.id}
          onSelect={handleSelectPericia}
          loading={loadingPericias}
          onNewClick={() => setIsNewDialogOpen(true)}
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
                  onSelect={handleSelectPericia}
                  loading={loadingPericias}
                  onNewClick={() => {
                    setIsSheetOpen(false)
                    setIsNewDialogOpen(true)
                  }}
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

          <div className="flex items-center gap-2">
            {selectedPericia && (
              <Sheet open={isAnexosSheetOpen} onOpenChange={setIsAnexosSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 xl:hidden">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-0">
                  <div className="flex h-14 shrink-0 items-center border-b px-4 font-medium">
                    Anexos do Processo
                  </div>
                  <ScrollArea className="h-[calc(100vh-3.5rem)]">
                    <AnexosList pericia={pericias.find((p) => p.id === selectedPericia.id)} />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}

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

      {/* Right Sidebar for Attachments */}
      {selectedPericia && (
        <div className="hidden w-[280px] shrink-0 flex-col border-l bg-card/50 xl:flex">
          <div className="flex h-14 shrink-0 items-center border-b px-4 font-medium">
            Anexos do Processo
          </div>
          <ScrollArea className="flex-1">
            <AnexosList pericia={pericias.find((p) => p.id === selectedPericia.id)} />
          </ScrollArea>
        </div>
      )}

      <Dialog
        open={isNewDialogOpen}
        onOpenChange={(open) => {
          setIsNewDialogOpen(open)
          if (!open) form.reset()
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Perícia</DialogTitle>
            <DialogDescription>
              Crie um novo caso para iniciar a análise de documentos.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewPericia)} className="space-y-4">
              <FormField
                control={form.control}
                name="numeroProcesso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número do Processo <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 0000000-00.0000.0.00.0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vara"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vara</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1ª Vara Cível" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comarca / Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo - SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataPericia"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Perícia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNewDialogOpen(false)
                    form.reset()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Perícia'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
