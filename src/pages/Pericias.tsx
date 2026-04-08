import { useState } from 'react'
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, CalendarPlus } from 'lucide-react'

import { usePericias } from '@/contexts/PericiasContext'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { PericiaForm } from '@/components/PericiaForm'

import { Pericia } from '@/lib/types'

export default function Pericias() {
  const { pericias } = usePericias()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedPericia, setSelectedPericia] = useState<Pericia | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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

  const renderDate = (d?: string | Date | null) => {
    if (!d) return '-'
    const parsed = parseDateSafe(d)
    return parsed ? parsed.toLocaleDateString('pt-BR') : '-'
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
                <TableHead className="w-[100px] pl-4 sm:pl-6">ID</TableHead>
                <TableHead>Cód. Interno</TableHead>
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
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                    <TableCell className="font-medium pl-4 sm:pl-6">{pericia.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{pericia.codigoInterno}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {pericia.numeroProcesso}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{pericia.vara}</TableCell>
                    <TableCell>
                      {new Date(pericia.dataPericia).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{getStatusBadge(pericia.status)}</TableCell>
                    <TableCell
                      className="text-right pr-4 sm:pr-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <CalendarPlus className="mr-2 h-4 w-4" />
                              <span>Adicionar à Agenda</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                {(pericia.dataNomeacao || pericia.data_nomeacao) && (
                                  <DropdownMenuItem
                                    onClick={() => handleExport(pericia, 'nomeacao')}
                                  >
                                    Nomeação
                                  </DropdownMenuItem>
                                )}
                                {(pericia.dataPericia || pericia.data_pericia) && (
                                  <DropdownMenuItem
                                    onClick={() => handleExport(pericia, 'pericia')}
                                  >
                                    Visita Técnica
                                  </DropdownMenuItem>
                                )}
                                {(pericia.dataEntregaLaudo || pericia.data_entrega_laudo) && (
                                  <DropdownMenuItem
                                    onClick={() => handleExport(pericia, 'entrega')}
                                  >
                                    Prazo do Laudo
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <div className="mt-6 space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPericia.codigoInterno}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPericia.numeroProcesso}</p>
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
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
