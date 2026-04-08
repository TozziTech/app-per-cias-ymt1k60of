import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CalendarPlus,
  Upload,
  FileIcon,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'

import { usePericias } from '@/contexts/PericiasContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  uploadAnexo,
  deleteAnexo,
  getAnexoUrl,
  logActivity,
  getPericiaLogs,
} from '@/services/pericias'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadIcs } from '@/lib/ics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PericiaForm } from '@/components/PericiaForm'

import { Pericia } from '@/lib/types'

export default function Pericias() {
  const { pericias } = usePericias()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedPericia, setSelectedPericia] = useState<Pericia | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const fetchLogs = async (periciaId: string) => {
    setIsLoadingLogs(true)
    try {
      const data = await getPericiaLogs(periciaId)
      setLogs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (selectedPericia && isDetailsOpen) {
      fetchLogs(selectedPericia.id)
    }
  }, [selectedPericia?.id, isDetailsOpen])

  const filteredPericias = pericias.filter((p) => {
    const matchSearch =
      p.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = statusFilter === 'todos' || p.status === statusFilter

    return matchSearch && matchStatus
  })

  const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
    if (!d) return null
    const parsed = new Date(d)
    if (isNaN(parsed.getTime())) return null
    return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
  }

  const getPrazoStatus = (p: Pericia) => {
    if (p.status === 'Concluído') return null
    const prazoStr =
      p.prazoEntrega ||
      (p as any).prazo_entrega ||
      p.dataEntregaLaudo ||
      (p as any).data_entrega_laudo
    if (!prazoStr) return null

    const prazo = parseDateSafe(prazoStr)
    if (!prazo) return null

    const diff = differenceInCalendarDays(prazo, new Date())
    if (diff < 0) return { status: 'atrasado', dias: Math.abs(diff) }
    if (diff <= 7) return { status: 'proximo', dias: diff }
    return null
  }

  const handleExport = (pericia: any, type: 'nomeacao' | 'pericia' | 'entrega') => {
    let dateField
    let titlePrefix
    if (type === 'nomeacao') {
      dateField = pericia.dataNomeacao || pericia.data_nomeacao
      titlePrefix = 'Nomeação'
    } else if (type === 'pericia') {
      dateField = pericia.dataPericia || pericia.data_pericia
      titlePrefix = 'Visita Técnica'
    } else {
      dateField = pericia.dataEntregaLaudo || pericia.data_entrega_laudo
      titlePrefix = 'Prazo do Laudo'
    }

    const parsedDate = parseDateSafe(dateField)
    if (!parsedDate) return

    downloadIcs({
      title: `${titlePrefix} - Proc: ${pericia.numeroProcesso || pericia.numero_processo || pericia.codigoInterno || pericia.codigo_interno || 'Sem Número'}`,
      description: `Processo: ${pericia.numeroProcesso || pericia.numero_processo || ''}\nStatus: ${pericia.status || ''}\nVara: ${pericia.vara || ''}\nObservações: ${pericia.observacoes || ''}`,
      location: pericia.endereco || pericia.cidade || '',
      startDate: parsedDate,
      allDay: true,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>
      case 'Em Andamento':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Em Andamento
          </Badge>
        )
      case 'Pendente':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            Pendente
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleRowClick = (pericia: Pericia) => {
    setSelectedPericia(pericia)
    setIsDetailsOpen(true)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedPericia) return

    try {
      setIsUploading(true)
      const novoAnexo = await uploadAnexo(selectedPericia.id, file, user?.id)
      setSelectedPericia((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          anexos: [novoAnexo, ...(prev.anexos || [])],
        }
      })
      toast({ title: 'Sucesso', description: 'Arquivo anexado com sucesso.' })
      fetchLogs(selectedPericia.id)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar arquivo.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    if (!confirm('Deseja realmente excluir este anexo?')) return
    if (!selectedPericia) return

    try {
      await deleteAnexo(anexoId, filePath, selectedPericia.id, fileName, user?.id)
      setSelectedPericia((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          anexos: prev.anexos?.filter((a) => a.id !== anexoId),
        }
      })
      fetchLogs(selectedPericia.id)
      toast({ title: 'Sucesso', description: 'Anexo removido.' })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover arquivo.', variant: 'destructive' })
    }
  }

  const handleDownloadAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    try {
      const url = await getAnexoUrl(filePath)

      if (selectedPericia) {
        await logActivity(
          'download',
          'documento',
          selectedPericia.id,
          { anexo_id: anexoId, file_name: fileName },
          user?.id,
        )
        fetchLogs(selectedPericia.id)
      }

      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar link de download.',
        variant: 'destructive',
      })
    }
  }

  const handleViewAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    try {
      const url = await getAnexoUrl(filePath)

      if (selectedPericia) {
        await logActivity(
          'visualizacao',
          'documento',
          selectedPericia.id,
          { anexo_id: anexoId, file_name: fileName },
          user?.id,
        )
        fetchLogs(selectedPericia.id)
      }

      window.open(url, '_blank')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao gerar link de visualização.',
        variant: 'destructive',
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderDate = (d?: string | Date | null) => {
    if (!d) return '-'
    const parsed = parseDateSafe(d)
    return parsed ? parsed.toLocaleDateString('pt-BR') : '-'
  }

  const formatLogAction = (action: string, entityType: string) => {
    if (action === 'download') return 'baixou o documento'
    if (action === 'visualizacao') return 'visualizou o documento'
    if (action === 'upload') return 'anexou o documento'
    if (action === 'excluiu' && entityType === 'documento') return 'excluiu o documento'
    if (action === 'criou') return `criou ${entityType === 'perícia' ? 'a perícia' : 'o registro'}`
    if (action === 'atualizou')
      return `atualizou ${entityType === 'perícia' ? 'a perícia' : 'o registro'}`
    if (action === 'excluiu')
      return `excluiu ${entityType === 'perícia' ? 'a perícia' : 'o registro'}`
    return action
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de Perícias</h1>
          <p className="text-muted-foreground">Gerencie os laudos e vistorias de engenharia.</p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Nova Perícia
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl md:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cadastrar Nova Perícia</SheetTitle>
              <SheetDescription>
                Preencha os detalhes do novo caso. Clique em salvar quando terminar.
              </SheetDescription>
            </SheetHeader>
            <PericiaForm onSuccess={() => setIsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium hidden sm:block">Registros</CardTitle>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar ID, Processo..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-4 sm:pl-6">Cód. Interno</TableHead>
                <TableHead className="hidden md:table-cell">Processo</TableHead>
                <TableHead className="hidden lg:table-cell">Vara</TableHead>
                <TableHead>Data Perícia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4 sm:pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPericias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma perícia encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPericias.map((pericia) => (
                  <TableRow
                    key={pericia.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(pericia)}
                  >
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="font-medium">{pericia.codigoInterno}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {pericia.numeroProcesso}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{pericia.vara}</TableCell>
                    <TableCell>
                      {new Date(pericia.dataPericia).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(pericia.status)}
                        {(() => {
                          const prazoStatus = getPrazoStatus(pericia)
                          if (prazoStatus?.status === 'atrasado') {
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent>Atrasado há {prazoStatus.dias} dias</TooltipContent>
                              </Tooltip>
                            )
                          }
                          if (prazoStatus?.status === 'proximo') {
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Clock className="h-4 w-4 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {prazoStatus.dias === 0
                                    ? 'Vence hoje'
                                    : `Vence em ${prazoStatus.dias} dias`}
                                </TooltipContent>
                              </Tooltip>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-right pr-4 sm:pr-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRowClick(pericia)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>

                        {(pericia.dataNomeacao || pericia.data_nomeacao) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleExport(pericia, 'nomeacao')}
                              >
                                <CalendarPlus className="h-4 w-4 text-blue-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Agenda: Nomeação</TooltipContent>
                          </Tooltip>
                        )}

                        {(pericia.dataPericia || pericia.data_pericia) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleExport(pericia, 'pericia')}
                              >
                                <CalendarPlus className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Agenda: Visita Técnica</TooltipContent>
                          </Tooltip>
                        )}

                        {(pericia.dataEntregaLaudo || pericia.data_entrega_laudo) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleExport(pericia, 'entrega')}
                              >
                                <CalendarPlus className="h-4 w-4 text-emerald-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Agenda: Prazo do Laudo</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-2xl overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Detalhes da Perícia</SheetTitle>
            <SheetDescription>Informações completas do processo e andamento.</SheetDescription>
          </SheetHeader>

          {selectedPericia && (
            <Tabs defaultValue="detalhes" className="w-full mt-6 pb-12">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="detalhes">Detalhes e Arquivos</TabsTrigger>
                <TabsTrigger value="historico">Histórico de Acesso</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPericia.codigoInterno}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPericia.numeroProcesso}
                    </p>
                  </div>
                  {getStatusBadge(selectedPericia.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vara</p>
                    <p className="font-medium">{selectedPericia.vara || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cidade</p>
                    <p className="font-medium">{selectedPericia.cidade || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Juiz</p>
                    <p className="font-medium">{selectedPericia.juiz || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Honorários</p>
                    <p className="font-medium">
                      {selectedPericia.honorarios
                        ? `R$ ${selectedPericia.honorarios.toFixed(2)}`
                        : '-'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Endereço</p>
                    <p className="font-medium">{selectedPericia.endereco || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <h4 className="col-span-2 font-medium">Datas Principais</h4>
                  <div>
                    <p className="text-muted-foreground">Nomeação</p>
                    <p className="font-medium">{renderDate(selectedPericia.dataNomeacao)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Perícia (Vistoria)</p>
                    <p className="font-medium">{renderDate(selectedPericia.dataPericia)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entrega Laudo</p>
                    <p className="font-medium">{renderDate(selectedPericia.dataEntregaLaudo)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <h4 className="col-span-2 font-medium">Envolvidos</h4>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Justiça Gratuita?</p>
                    <p className="font-medium">{selectedPericia.justicaGratuita ? 'Sim' : 'Não'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Advogado Autora</p>
                    <p className="font-medium">{selectedPericia.advogadoAutora || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Advogado Ré</p>
                    <p className="font-medium">{selectedPericia.advogadoRe || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ass. Téc. Autora</p>
                    <p className="font-medium">{selectedPericia.assistenteTecnicoAutora || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ass. Téc. Ré</p>
                    <p className="font-medium">{selectedPericia.assistenteTecnicoRe || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Perito Associado</p>
                    <p className="font-medium">{selectedPericia.peritoAssociado || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <h4 className="col-span-2 font-medium">Impugnação e Esclarecimentos</h4>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Descrição Impugnação</p>
                    <p className="font-medium">{selectedPericia.descricaoImpugnacao || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Impugnação</p>
                    <p className="font-medium">{renderDate(selectedPericia.dataImpugnacao)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dias Impugnação</p>
                    <p className="font-medium">{selectedPericia.diasImpugnacao || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prazo de Entrega</p>
                    <p className="font-medium">{renderDate(selectedPericia.prazoEntrega)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entrega Impugnação</p>
                    <p className="font-medium">{renderDate(selectedPericia.entregaImpugnacao)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Limites Esclarecimentos</p>
                    <p className="font-medium">{selectedPericia.limitesEsclarecimentos || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Entrega Esclarecimentos</p>
                    <p className="font-medium">
                      {renderDate(selectedPericia.entregaEsclarecimentos)}
                    </p>
                  </div>
                </div>

                {(selectedPericia.observacoes || selectedPericia.linkNuvem) && (
                  <div className="border-t pt-4 text-sm space-y-4">
                    <h4 className="font-medium">Outros Detalhes</h4>
                    {selectedPericia.observacoes && (
                      <div>
                        <p className="text-muted-foreground">Observações</p>
                        <p className="font-medium">{selectedPericia.observacoes}</p>
                      </div>
                    )}
                    {selectedPericia.linkNuvem && (
                      <div>
                        <p className="text-muted-foreground">Link Nuvem</p>
                        <a
                          href={selectedPericia.linkNuvem}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Acessar Arquivos
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4 text-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Anexos de Documentos</h4>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Anexar Arquivo
                      </Button>
                    </div>
                  </div>

                  {!selectedPericia.anexos || selectedPericia.anexos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 border rounded-md border-dashed">
                      Nenhum arquivo anexado.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPericia.anexos.map((anexo) => (
                        <div
                          key={anexo.id}
                          className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <FileIcon className="h-8 w-8 text-primary shrink-0" />
                            <div className="truncate">
                              <p className="font-medium truncate" title={anexo.file_name}>
                                {anexo.file_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(anexo.size)} •{' '}
                                {new Date(anexo.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Visualizar"
                              onClick={() =>
                                handleViewAnexo(anexo.id, anexo.file_path, anexo.file_name)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Baixar"
                              onClick={() =>
                                handleDownloadAnexo(anexo.id, anexo.file_path, anexo.file_name)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Excluir"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleDeleteAnexo(anexo.id, anexo.file_path, anexo.file_name)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPericia.checklist && selectedPericia.checklist.length > 0 && (
                  <div className="border-t pt-4 text-sm">
                    <h4 className="font-medium mb-3">Checklist</h4>
                    <ul className="space-y-2">
                      {selectedPericia.checklist.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded-sm border flex items-center justify-center ${item.concluido ? 'bg-primary border-primary' : 'border-input'}`}
                          >
                            {item.concluido && <div className="h-2 w-2 bg-white rounded-sm" />}
                          </div>
                          <span
                            className={item.concluido ? 'line-through text-muted-foreground' : ''}
                          >
                            {item.texto}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="space-y-6 mt-0">
                <div className="space-y-4 pt-2">
                  {isLoadingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado.
                    </p>
                  ) : (
                    <div className="relative border-l border-muted ml-3 space-y-6 pl-6">
                      {logs.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">
                              {log.user?.name || log.user?.email || 'Sistema'}
                              <span className="font-normal text-muted-foreground mx-1">
                                {formatLogAction(log.action, log.entity_type)}
                              </span>
                              {log.entity_type === 'documento' && log.details?.file_name && (
                                <span
                                  className="font-medium text-primary"
                                  title={log.details.file_name}
                                >
                                  {log.details.file_name.length > 30
                                    ? log.details.file_name.substring(0, 30) + '...'
                                    : log.details.file_name}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </p>
                            {log.details &&
                              log.entity_type === 'perícia' &&
                              log.action === 'atualizou' && (
                                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                                  {Object.entries(log.details).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </span>{' '}
                                      {String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
