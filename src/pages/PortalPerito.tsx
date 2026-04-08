import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Pericia } from '@/lib/types'
import {
  getMyPericias,
  updatePericia,
  uploadAnexo,
  deleteAnexo,
  getAnexoUrl,
} from '@/services/pericias'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Briefcase,
  FileText,
  Upload,
  Trash2,
  Clock,
  Calendar,
  Search,
  MapPin,
  Building,
  CheckCircle2,
  User,
  Loader2,
  Eye,
  Plus,
} from 'lucide-react'

interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export default function PortalPerito() {
  const { toast } = useToast()
  const [pericias, setPericias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      setCurrentUser(session.user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const data = await getMyPericias(session.user.email, profile?.name)
      setPericias(data)
    } catch (error) {
      console.error(error)
      toast({ title: 'Erro ao carregar perícias', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const normalizeChecklist = (checklist: any): ChecklistItem[] => {
    if (!Array.isArray(checklist)) return []
    return checklist.map((item, i) => {
      if (typeof item === 'string') return { id: crypto.randomUUID(), text: item, done: false }
      return item as ChecklistItem
    })
  }

  const toggleChecklistItem = async (
    periciaId: string,
    itemIndex: number,
    currentChecklist: any[],
  ) => {
    const normChecklist = normalizeChecklist(currentChecklist)
    const newChecklist = [...normChecklist]
    newChecklist[itemIndex].done = !newChecklist[itemIndex].done

    // Optimistic update
    setPericias((prev) =>
      prev.map((p) => (p.id === periciaId ? { ...p, checklist: newChecklist } : p)),
    )

    try {
      await updatePericia(periciaId, { checklist: newChecklist as any })
    } catch (e) {
      toast({ title: 'Erro ao atualizar tarefa', variant: 'destructive' })
      fetchData() // Revert
    }
  }

  const addTask = async (pericia: any) => {
    if (!newTaskText.trim()) return

    const normChecklist = normalizeChecklist(pericia.checklist)
    const newTask: ChecklistItem = { id: crypto.randomUUID(), text: newTaskText, done: false }
    const newChecklist = [...normChecklist, newTask]

    setPericias((prev) =>
      prev.map((p) => (p.id === pericia.id ? { ...p, checklist: newChecklist } : p)),
    )
    setNewTaskText('')

    try {
      await updatePericia(pericia.id, { checklist: newChecklist as any })
      toast({ title: 'Tarefa adicionada' })
    } catch (e) {
      toast({ title: 'Erro ao adicionar tarefa', variant: 'destructive' })
      fetchData()
    }
  }

  const handleFileUpload = async (periciaId: string, file: File) => {
    try {
      setUploadingId(periciaId)
      await uploadAnexo(periciaId, file, currentUser?.id)
      toast({ title: 'Documento enviado com sucesso' })
      fetchData()
    } catch (e) {
      toast({ title: 'Erro ao enviar documento', variant: 'destructive' })
    } finally {
      setUploadingId(null)
    }
  }

  const handleDeleteAnexo = async (
    anexoId: string,
    filePath: string,
    periciaId: string,
    fileName: string,
  ) => {
    try {
      await deleteAnexo(anexoId, filePath, periciaId, fileName, currentUser?.id)
      toast({ title: 'Documento excluído' })
      fetchData()
    } catch (e) {
      toast({ title: 'Erro ao excluir documento', variant: 'destructive' })
    }
  }

  const handleViewAnexo = async (filePath: string) => {
    try {
      const url = await getAnexoUrl(filePath)
      window.open(url, '_blank')
    } catch (error) {
      toast({ title: 'Erro ao abrir arquivo', variant: 'destructive' })
    }
  }

  const updateStatus = async (periciaId: string, newStatus: string) => {
    setPericias((prev) => prev.map((p) => (p.id === periciaId ? { ...p, status: newStatus } : p)))
    try {
      await updatePericia(periciaId, { status: newStatus as any })
      toast({ title: 'Status atualizado' })
    } catch (e) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
      fetchData()
    }
  }

  const filteredPericias = pericias.filter(
    (p) =>
      p.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vara?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingCount = pericias.filter((p) => p.status !== 'Concluído').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Agendado':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Cancelado':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Portal do Perito
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gerencie suas perícias atribuídas, documentos e tarefas.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Atribuídas</p>
              <p className="text-2xl font-bold">{pericias.length}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pendentes</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar pelo número do processo, vara ou cidade..."
          className="pl-9 max-w-md bg-white dark:bg-zinc-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : filteredPericias.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Briefcase className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Nenhuma perícia encontrada
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400">
            Você ainda não possui perícias atribuídas ou a busca não retornou resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPericias.map((pericia) => (
            <Card
              key={pericia.id}
              className="flex flex-col hover:border-blue-500/50 transition-colors bg-white dark:bg-zinc-900 shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={getStatusColor(pericia.status || 'Pendente')}>
                    {pericia.status || 'Pendente'}
                  </Badge>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(pericia.dataPericia)}
                  </span>
                </div>
                <CardTitle
                  className="text-lg leading-tight line-clamp-1"
                  title={pericia.numeroProcesso}
                >
                  {pericia.numeroProcesso || 'Sem número'}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {pericia.cidade || 'Cidade não informada'} •{' '}
                  {pericia.vara || 'Vara não informada'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="text-sm space-y-2 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">Autora:</span>
                    <span className="truncate ml-2" title={pericia.advogadoAutora}>
                      {pericia.advogadoAutora || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">Ré:</span>
                    <span className="truncate ml-2" title={pericia.advogadoRe}>
                      {pericia.advogadoRe || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <CheckSquare className="h-4 w-4" />
                    <span>
                      {normalizeChecklist(pericia.checklist).filter((i) => i.done).length}/
                      {normalizeChecklist(pericia.checklist).length} Tarefas
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <FileText className="h-4 w-4" />
                    <span>{pericia.anexos?.length || 0} Docs</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                      Abrir Área de Trabalho
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-xl w-full flex flex-col bg-white dark:bg-zinc-950 p-0 border-l border-zinc-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <SheetHeader>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={getStatusColor(pericia.status || 'Pendente')}
                          >
                            {pericia.status || 'Pendente'}
                          </Badge>
                          <div className="flex gap-2">
                            {pericia.status !== 'Concluído' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(pericia.id, 'Concluído')}
                                className="h-8 gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Marcar Concluído
                              </Button>
                            )}
                          </div>
                        </div>
                        <SheetTitle className="text-xl mt-3">{pericia.numeroProcesso}</SheetTitle>
                        <SheetDescription>
                          {pericia.vara} • {pericia.cidade}
                        </SheetDescription>
                      </SheetHeader>
                    </div>

                    <Tabs defaultValue="tarefas" className="flex-1 flex flex-col min-h-0">
                      <div className="px-6 pt-4">
                        <TabsList className="grid w-full grid-cols-3 bg-zinc-100 dark:bg-zinc-900">
                          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
                          <TabsTrigger value="documentos">Documentos</TabsTrigger>
                          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                        </TabsList>
                      </div>

                      <ScrollArea className="flex-1 p-6">
                        <TabsContent
                          value="tarefas"
                          className="mt-0 h-full flex flex-col space-y-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              placeholder="Nova tarefa..."
                              value={newTaskText}
                              onChange={(e) => setNewTaskText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addTask(pericia)
                              }}
                            />
                            <Button size="icon" onClick={() => addTask(pericia)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {normalizeChecklist(pericia.checklist).length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-8">
                              Nenhuma tarefa cadastrada.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {normalizeChecklist(pericia.checklist).map((item, index) => (
                                <div
                                  key={item.id}
                                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${item.done ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm'}`}
                                >
                                  <Checkbox
                                    id={`check-${pericia.id}-${index}`}
                                    checked={item.done}
                                    onCheckedChange={() =>
                                      toggleChecklistItem(pericia.id, index, pericia.checklist)
                                    }
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor={`check-${pericia.id}-${index}`}
                                    className={`text-sm leading-snug cursor-pointer ${item.done ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}
                                  >
                                    {item.text}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="documentos" className="mt-0 h-full space-y-4">
                          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="p-3 bg-blue-500/10 rounded-full mb-3">
                              <Upload className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-medium mb-1">Upload de Arquivo</h3>
                            <p className="text-xs text-zinc-500 mb-4">
                              Envie laudos, petições ou recibos (PDF, DOCX, Imagens)
                            </p>
                            <div className="relative">
                              <Input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(pericia.id, e.target.files[0])
                                  }
                                }}
                                disabled={uploadingId === pericia.id}
                              />
                              <Button disabled={uploadingId === pericia.id}>
                                {uploadingId === pericia.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                                  </>
                                ) : (
                                  'Selecionar Arquivo'
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3 mt-6">
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              Arquivos Anexados ({pericia.anexos?.length || 0})
                            </h4>
                            {pericia.anexos?.length === 0 ? (
                              <p className="text-sm text-zinc-500 text-center py-4">
                                Nenhum documento anexado.
                              </p>
                            ) : (
                              pericia.anexos?.map((anexo: any) => (
                                <div
                                  key={anexo.id}
                                  className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                                    <div className="overflow-hidden">
                                      <p
                                        className="text-sm font-medium truncate"
                                        title={anexo.file_name}
                                      >
                                        {anexo.file_name}
                                      </p>
                                      <p className="text-xs text-zinc-500">
                                        {(anexo.size / 1024 / 1024).toFixed(2)} MB •{' '}
                                        {new Date(anexo.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0 ml-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleViewAnexo(anexo.file_path)}
                                    >
                                      <Eye className="h-4 w-4 text-zinc-500" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                      onClick={() =>
                                        handleDeleteAnexo(
                                          anexo.id,
                                          anexo.file_path,
                                          pericia.id,
                                          anexo.file_name,
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="detalhes" className="mt-0 h-full">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2 mb-3">
                                Informações Gerais
                              </h4>
                              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Juiz</p>
                                  <p className="text-sm font-medium">{pericia.juiz || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Data da Perícia</p>
                                  <p className="text-sm font-medium">
                                    {formatDate(pericia.dataPericia)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Prazo Entrega Laudo</p>
                                  <p className="text-sm font-medium">
                                    {formatDate(pericia.dataEntregaLaudo)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Justiça Gratuita</p>
                                  <Badge
                                    variant={pericia.justicaGratuita ? 'default' : 'secondary'}
                                    className="mt-1"
                                  >
                                    {pericia.justicaGratuita ? 'Sim' : 'Não'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2 mb-3">
                                Partes Envolvidas
                              </h4>
                              <div className="space-y-4">
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg">
                                  <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">
                                    Parte Autora
                                  </p>
                                  <p className="text-sm font-medium">
                                    {pericia.advogadoAutora || '-'}
                                  </p>
                                  {pericia.assistenteTecnicoAutora && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                      Assistente: {pericia.assistenteTecnicoAutora}
                                    </p>
                                  )}
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg">
                                  <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">
                                    Parte Ré
                                  </p>
                                  <p className="text-sm font-medium">{pericia.advogadoRe || '-'}</p>
                                  {pericia.assistenteTecnicoRe && (
                                    <p className="text-xs text-zinc-500 mt-1">
                                      Assistente: {pericia.assistenteTecnicoRe}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {pericia.observacoes && (
                              <div>
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2 mb-3">
                                  Observações
                                </h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                  {pericia.observacoes}
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </SheetContent>
                </Sheet>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
