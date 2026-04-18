import { useState, useRef, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Mail,
  Printer,
  MapPin,
  Upload,
  FileIcon,
  Eye,
  Download,
  Trash2,
  Check,
  Edit,
  Loader2,
} from 'lucide-react'
import { Pericia } from '@/lib/types'
import { usePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { usePericias } from '@/contexts/PericiasContext'
import {
  uploadAnexo,
  deleteAnexo,
  getAnexoUrl,
  logActivity,
  getPericiaLogs,
} from '@/services/pericias'
import { renderDate, isParada, formatFileSize } from './utils'
import { PaymentBadge, StatusBadge } from './badges'
import { GeradorPeticoes } from '@/components/GeradorPeticoes'
import { ChecklistVistoria } from '@/components/ChecklistVistoria'

const PETICOES_PADRAO = [
  'Petição Pedido de Honorários',
  'Petição de Aceite',
  'Petição de Agendamento da Perícia',
  'Petição de Recusa',
  'Petição Pedido de Documentação',
  'Petição de Liberação de Honorários Antecipado',
  'Petição de Prorrogação de Prazo',
  'Petição de Liberação de Honorários',
  'Petição de Entrega de Laudo Pericial',
  'Petição de Manifestação sobre Assistente Técnico',
  'Petição de Esclarecimentos (Manifestação à Impugnação)',
  'Petição de Reiteração de Pedido',
]

interface Props {
  pericia: Pericia | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPericiaUpdate: (p: Pericia) => void
}

export function PericiaDetails({ pericia, isOpen, onOpenChange, onPericiaUpdate }: Props) {
  const { isPerito, canEditFinanceiro } = usePermissions()
  const { user } = useAuth()
  const { toast } = useToast()
  const { updatePericia } = usePericias()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const [newPeticaoText, setNewPeticaoText] = useState('')
  const [selectedPeticaoType, setSelectedPeticaoType] = useState<string>('')
  const [editingPeticaoId, setEditingPeticaoId] = useState<string | null>(null)
  const [editingPeticaoText, setEditingPeticaoText] = useState('')

  const fetchLogs = async (id: string) => {
    setIsLoadingLogs(true)
    try {
      setLogs(await getPericiaLogs(id))
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (pericia && isOpen) fetchLogs(pericia.id)
  }, [pericia?.id, isOpen])

  if (!pericia) return null

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const novoAnexo = await uploadAnexo(pericia.id, file, user?.id)
      onPericiaUpdate({ ...pericia, anexos: [novoAnexo, ...(pericia.anexos || [])] })
      toast({ title: 'Sucesso', description: 'Arquivo anexado com sucesso.' })
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao enviar arquivo.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    if (!confirm('Deseja realmente excluir este anexo?')) return
    try {
      await deleteAnexo(anexoId, filePath, pericia.id, fileName, user?.id)
      onPericiaUpdate({ ...pericia, anexos: pericia.anexos?.filter((a) => a.id !== anexoId) })
      toast({ title: 'Sucesso', description: 'Anexo removido.' })
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover arquivo.', variant: 'destructive' })
    }
  }

  const handleDownloadAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    try {
      const url = await getAnexoUrl(filePath)
      await logActivity(
        'download',
        'documento',
        pericia.id,
        { anexo_id: anexoId, file_name: fileName },
        user?.id,
      )
      fetchLogs(pericia.id)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao gerar link.', variant: 'destructive' })
    }
  }

  const handleViewAnexo = async (anexoId: string, filePath: string, fileName: string) => {
    try {
      const url = await getAnexoUrl(filePath)
      await logActivity(
        'visualizacao',
        'documento',
        pericia.id,
        { anexo_id: anexoId, file_name: fileName },
        user?.id,
      )
      fetchLogs(pericia.id)
      window.open(url, '_blank')
    } catch {
      toast({ title: 'Erro', description: 'Falha ao gerar link.', variant: 'destructive' })
    }
  }

  const handleTogglePeticao = async (itemId: string, concluido: boolean) => {
    const peticoes = (pericia.peticoes || []).map((i) =>
      i.id === itemId ? { ...i, concluido } : i,
    )
    try {
      await updatePericia(pericia.id, { peticoes })
      onPericiaUpdate({ ...pericia, peticoes })
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  const handleAddPeticao = async () => {
    const text = selectedPeticaoType === 'Outra' ? newPeticaoText.trim() : selectedPeticaoType
    if (!text) return
    const peticoes = [
      ...(pericia.peticoes || []),
      { id: crypto.randomUUID(), texto: text, concluido: false },
    ]
    try {
      await updatePericia(pericia.id, { peticoes })
      onPericiaUpdate({ ...pericia, peticoes })
      setNewPeticaoText('')
      setSelectedPeticaoType('')
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao adicionar.', variant: 'destructive' })
    }
  }

  const saveEditPeticao = async () => {
    if (!editingPeticaoId) return
    const peticoes = (pericia.peticoes || []).map((i) =>
      i.id === editingPeticaoId ? { ...i, texto: editingPeticaoText } : i,
    )
    try {
      await updatePericia(pericia.id, { peticoes })
      onPericiaUpdate({ ...pericia, peticoes })
      setEditingPeticaoId(null)
      setEditingPeticaoText('')
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao editar.', variant: 'destructive' })
    }
  }

  const handleRemovePeticao = async (itemId: string) => {
    const peticoes = (pericia.peticoes || []).filter((i) => i.id !== itemId)
    try {
      await updatePericia(pericia.id, { peticoes })
      onPericiaUpdate({ ...pericia, peticoes })
      fetchLogs(pericia.id)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' })
    }
  }

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const html = `<html>
      <head><style>body { font-family: sans-serif; padding: 40px; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;} .label { font-weight: bold; font-size: 12px; } .value { margin-bottom: 10px; }</style></head>
      <body>
        <h2>Relatório - ${pericia.codigoInterno || pericia.numeroProcesso}</h2>
        <div class="grid">
          <div><div class="label">Código</div><div class="value">${pericia.codigoInterno}</div></div>
          <div><div class="label">Processo</div><div class="value">${pericia.numeroProcesso}</div></div>
          <div><div class="label">Vara</div><div class="value">${pericia.vara}</div></div>
          <div><div class="label">Status</div><div class="value">${pericia.status}</div></div>
        </div>
        <script>window.print()</script>
      </body>
    </html>`
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-2xl overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Detalhes da Perícia</SheetTitle>
          <SheetDescription>Informações completas do processo e andamento.</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="detalhes" className="w-full mt-6 pb-12">
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4 mb-4 h-auto gap-1">
            <TabsTrigger value="detalhes" className="text-xs sm:text-sm py-2">
              Detalhes e Arquivos
            </TabsTrigger>
            <TabsTrigger value="gerador" className="text-xs sm:text-sm py-2">
              Gerador de Petições
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs sm:text-sm py-2">
              Checklist de Vistoria
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs sm:text-sm py-2">
              Histórico de Acesso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-6 mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{pericia.codigoInterno}</h3>
                <p className="text-sm text-muted-foreground">{pericia.numeroProcesso}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {isParada(pericia) && (
                  <Badge variant="destructive" className="animate-pulse">
                    Perícia Parada
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`mailto:?subject=Ref: Processo ${pericia.numeroProcesso}`)
                  }
                  className="shadow-sm hidden sm:flex"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintPdf} className="shadow-sm">
                  <Printer className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <StatusBadge status={pericia.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Vara</p>
                <p className="font-medium">{pericia.vara || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cidade</p>
                <p className="font-medium">{pericia.cidade || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Juiz</p>
                <p className="font-medium">{pericia.juiz || '-'}</p>
              </div>
              {canEditFinanceiro && (
                <>
                  <div>
                    <p className="text-muted-foreground">Honorários</p>
                    <p className="font-medium flex items-center">
                      {pericia.honorarios ? `R$ ${pericia.honorarios.toFixed(2)}` : '-'}
                      {pericia.honorariosParcelados && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Parcelado ({pericia.quantidadeParcelas}x)
                        </Badge>
                      )}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-muted-foreground">Status de Pagamento</p>
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    disabled={!canEditFinanceiro}
                    value={
                      (pericia as any).status_pagamento || pericia.statusPagamento || 'Pendente'
                    }
                    onValueChange={async (val) => {
                      try {
                        await updatePericia(pericia.id, { statusPagamento: val })
                        onPericiaUpdate({ ...pericia, statusPagamento: val })
                        toast({ title: 'Sucesso', description: 'Atualizado.' })
                        fetchLogs(pericia.id)
                      } catch {
                        toast({ title: 'Erro', variant: 'destructive' })
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 w-full sm:w-[130px]">
                      <SelectValue placeholder="Alterar" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Pendente', 'Recebido', 'Atrasado', 'Recusada'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <PaymentBadge
                    status={
                      (pericia as any).status_pagamento || pericia.statusPagamento || 'Pendente'
                    }
                  />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Endereço</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{pericia.endereco || '-'}</p>
                  {pericia.endereco && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pericia.endereco)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary hover:bg-muted p-1.5 rounded-md transition-colors shrink-0"
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Google Maps</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <h4 className="col-span-2 font-medium">Aprovação</h4>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium mt-1">
                  {pericia.aceite === 'Aceito' ? (
                    <Badge className="bg-emerald-500">Aceito</Badge>
                  ) : pericia.aceite === 'Recusado' ? (
                    <Badge variant="destructive">Recusado</Badge>
                  ) : (
                    <Badge variant="outline">Pendente</Badge>
                  )}
                </p>
              </div>
              {pericia.aceite === 'Recusado' && (
                <div>
                  <p className="text-muted-foreground">Justificativa</p>
                  <p className="font-medium mt-1">{pericia.justificativa_recusa || '-'}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <h4 className="col-span-2 font-medium">Datas Principais</h4>
              <div>
                <p className="text-muted-foreground">Nomeação</p>
                <p className="font-medium">{renderDate(pericia.dataNomeacao)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Perícia (Vistoria)</p>
                <p className="font-medium">{renderDate(pericia.dataPericia)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entrega Laudo</p>
                <p className="font-medium">{renderDate(pericia.dataEntregaLaudo)}</p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <h4 className="col-span-2 font-medium">Envolvidos</h4>
              <div className="col-span-2">
                <p className="text-muted-foreground">Justiça Gratuita?</p>
                <p className="font-medium">{pericia.justicaGratuita ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Advogado Autora</p>
                <p className="font-medium">{pericia.advogadoAutora || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Advogado Ré</p>
                <p className="font-medium">{pericia.advogadoRe || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ass. Téc. Autora</p>
                <p className="font-medium">{pericia.assistenteTecnicoAutora || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ass. Téc. Ré</p>
                <p className="font-medium">{pericia.assistenteTecnicoRe || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Profissional / Perito Associado (Nome)</p>
                <p className="font-medium">{pericia.peritoAssociado || '-'}</p>
              </div>
            </div>

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
                    )}{' '}
                    Anexar Arquivo
                  </Button>
                </div>
              </div>
              {!pericia.anexos || pericia.anexos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 border rounded-md border-dashed">
                  Nenhum arquivo anexado.
                </p>
              ) : (
                <div className="space-y-2">
                  {pericia.anexos.map((anexo) => (
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
                            {formatFileSize(anexo.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleViewAnexo(anexo.id, anexo.file_path, anexo.file_name)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownloadAnexo(anexo.id, anexo.file_path, anexo.file_name)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {!isPerito && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              handleDeleteAnexo(anexo.id, anexo.file_path, anexo.file_name)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 text-sm">
              <h4 className="font-medium mb-3">Controle de Petições</h4>
              <div className="space-y-3">
                <ul className="space-y-2">
                  {(pericia.peticoes || []).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 group">
                      <button
                        onClick={() => handleTogglePeticao(item.id, !item.concluido)}
                        className={`mt-0.5 h-5 w-5 shrink-0 rounded-sm border flex items-center justify-center transition-colors ${item.concluido ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}
                      >
                        {item.concluido && <Check className="h-3.5 w-3.5" />}
                      </button>
                      {editingPeticaoId === item.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={editingPeticaoText}
                            onChange={(e) => setEditingPeticaoText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditPeticao()}
                            className="h-7 text-xs"
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={saveEditPeticao}
                          >
                            <Check className="h-4 w-4 text-emerald-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`flex-1 pt-0.5 ${item.concluido ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item.texto}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingPeticaoId(item.id)
                                setEditingPeticaoText(item.texto)
                              }}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemovePeticao(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedPeticaoType}
                      onValueChange={(val) => {
                        setSelectedPeticaoType(val)
                        if (val !== 'Outra') setNewPeticaoText('')
                      }}
                    >
                      <SelectTrigger className="h-8 flex-1 text-sm">
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PETICOES_PADRAO.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                        <SelectItem value="Outra">Outra...</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleAddPeticao}
                      className="shrink-0 h-8"
                      disabled={
                        !selectedPeticaoType ||
                        (selectedPeticaoType === 'Outra' && !newPeticaoText.trim())
                      }
                    >
                      Adicionar
                    </Button>
                  </div>
                  {selectedPeticaoType === 'Outra' && (
                    <Input
                      value={newPeticaoText}
                      onChange={(e) => setNewPeticaoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddPeticao()
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gerador" className="space-y-6 mt-0">
            <GeradorPeticoes pericia={pericia} />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-6 mt-0">
            <ChecklistVistoria
              pericia={pericia}
              onUpdate={async (id, updates) => {
                await updatePericia(id, updates)
                onPericiaUpdate({ ...pericia, ...updates })
                fetchLogs(id)
              }}
            />
          </TabsContent>

          <TabsContent value="historico" className="space-y-6 mt-0">
            {isLoadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</p>
            ) : (
              <div className="relative border-l border-muted ml-3 space-y-6 pl-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {log.user?.name || log.user?.email || 'Sistema'}{' '}
                        <span className="font-normal text-muted-foreground">{log.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
