import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { CalendarPlus, AlertCircle, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Pericia } from '@/lib/types'
import { usePermissions } from '@/hooks/use-permissions'
import { usePericias } from '@/contexts/PericiasContext'
import { useToast } from '@/hooks/use-toast'
import { downloadIcs } from '@/lib/ics'
import { renderDate, getPrazoStatus, isParada, parseDateSafe } from './utils'
import { PaymentBadge, StatusBadge } from './badges'

interface PericiasListProps {
  pericias: Pericia[]
  visibleColumns: Record<string, boolean>
  onRowClick: (p: Pericia) => void
  onEdit: (p: Pericia) => void
  onDelete: (p: Pericia) => void
}

export function PericiasList({
  pericias,
  visibleColumns,
  onRowClick,
  onEdit,
  onDelete,
}: PericiasListProps) {
  const { isPerito } = usePermissions()
  const { updatePericia } = usePericias()
  const { toast } = useToast()

  const handleExport = (pericia: Pericia, type: 'nomeacao' | 'pericia' | 'entrega') => {
    let dateField
    let titlePrefix
    if (type === 'nomeacao') {
      dateField = pericia.dataNomeacao || (pericia as any).data_nomeacao
      titlePrefix = 'Nomeação'
    } else if (type === 'pericia') {
      dateField = pericia.dataPericia || (pericia as any).data_pericia
      titlePrefix = 'Visita Técnica'
    } else {
      dateField = pericia.dataEntregaLaudo || (pericia as any).data_entrega_laudo
      titlePrefix = 'Prazo do Laudo'
    }

    const parsedDate = parseDateSafe(dateField)
    if (!parsedDate) return

    downloadIcs({
      title: `${titlePrefix} - Proc: ${pericia.numeroProcesso || pericia.codigoInterno || 'Sem Número'}`,
      description: `Processo: ${pericia.numeroProcesso || ''}\nStatus: ${pericia.status || ''}\nVara: ${pericia.vara || ''}\nObservações: ${pericia.observacoes || ''}`,
      location: pericia.endereco || pericia.cidade || '',
      startDate: parsedDate,
      allDay: true,
    })
  }

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await updatePericia(id, { status })
      toast({ title: 'Sucesso', description: 'Status atualizado.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  const handleUpdateStatusPagamento = async (id: string, statusPagamento: string) => {
    try {
      await updatePericia(id, { statusPagamento })
      toast({ title: 'Sucesso', description: 'Status de pagamento atualizado.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          {visibleColumns.codigo && (
            <TableHead className="pl-4 sm:pl-6 py-2 h-10 text-xs">Código</TableHead>
          )}
          {visibleColumns.processo && <TableHead className="py-2 h-10 text-xs">Processo</TableHead>}
          {visibleColumns.perito && (
            <TableHead className="py-2 h-10 text-xs">Perito Associado</TableHead>
          )}
          {!isPerito && visibleColumns.honorarios && (
            <TableHead className="hidden xl:table-cell py-2 h-10 text-xs">Honorários</TableHead>
          )}
          {visibleColumns.datas && (
            <TableHead className="py-2 h-10 text-xs">
              Datas (Nomeação / Perícia / Entrega)
            </TableHead>
          )}
          {visibleColumns.pgto && (
            <TableHead className="hidden md:table-cell py-2 h-10 text-xs">Pgto.</TableHead>
          )}
          {visibleColumns.status && <TableHead className="py-2 h-10 text-xs">Status</TableHead>}
          <TableHead className="text-right pr-4 sm:pr-6 py-2 h-10 text-xs">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pericias.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
              Nenhuma perícia encontrada.
            </TableCell>
          </TableRow>
        ) : (
          pericias.map((pericia) => (
            <TableRow
              key={pericia.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onRowClick(pericia)}
            >
              {visibleColumns.codigo && (
                <TableCell className="pl-4 sm:pl-6 py-2">
                  <div className="font-medium text-xs whitespace-nowrap">
                    {pericia.codigoInterno || 'Sem Cód.'}
                  </div>
                </TableCell>
              )}
              {visibleColumns.processo && (
                <TableCell className="py-2">
                  {pericia.numeroProcesso ? (
                    <div
                      className="text-xs text-muted-foreground truncate max-w-[150px]"
                      title={pericia.numeroProcesso}
                    >
                      {pericia.numeroProcesso}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              )}
              {visibleColumns.perito && (
                <TableCell
                  className="py-2 text-xs truncate max-w-[120px]"
                  title={pericia.peritoAssociado || ''}
                >
                  {pericia.peritoAssociado || '-'}
                </TableCell>
              )}
              {!isPerito && visibleColumns.honorarios && (
                <TableCell className="hidden xl:table-cell py-2 text-xs">
                  {pericia.honorarios ? `R$ ${pericia.honorarios.toFixed(2)}` : '-'}
                </TableCell>
              )}
              {visibleColumns.datas && (
                <TableCell className="py-2 text-xs min-w-[240px]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Nomeação:</span>
                      <span className="font-medium flex-1">{renderDate(pericia.dataNomeacao)}</span>
                      {(pericia.dataNomeacao || (pericia as any).data_nomeacao) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExport(pericia, 'nomeacao')
                              }}
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agenda: Nomeação</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Perícia:</span>
                      <span className="font-medium flex-1">{renderDate(pericia.dataPericia)}</span>
                      {(pericia.dataPericia || (pericia as any).data_pericia) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExport(pericia, 'pericia')
                              }}
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agenda: Visita Técnica</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">Entrega:</span>
                      <span className="font-medium flex-1 flex items-center gap-1.5">
                        {renderDate(pericia.dataEntregaLaudo)}
                        {(() => {
                          const prazoStatus = getPrazoStatus(pericia)
                          if (prazoStatus?.status === 'atrasado')
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 text-destructive animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent>Atrasado há {prazoStatus.dias} dias</TooltipContent>
                              </Tooltip>
                            )
                          if (prazoStatus?.status === 'proximo')
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {prazoStatus.dias === 0
                                    ? 'Vence hoje'
                                    : `Vence em ${prazoStatus.dias} dias`}
                                </TooltipContent>
                              </Tooltip>
                            )
                          return null
                        })()}
                      </span>
                      {(pericia.dataEntregaLaudo || (pericia as any).data_entrega_laudo) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExport(pericia, 'entrega')
                              }}
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-emerald-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agenda: Prazo do Laudo</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TableCell>
              )}
              {visibleColumns.pgto && (
                <TableCell
                  className="hidden md:table-cell py-2 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none scale-90 origin-left hover:opacity-80 transition-opacity">
                        <PaymentBadge
                          status={
                            (pericia as any).status_pagamento ||
                            pericia.statusPagamento ||
                            'Pendente'
                          }
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {['Pendente', 'Recebido', 'Atrasado', 'Recusada'].map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleUpdateStatusPagamento(pericia.id, s)}
                        >
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
              {visibleColumns.status && (
                <TableCell className="py-2 text-xs" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="focus:outline-none scale-90 origin-left hover:opacity-80 transition-opacity">
                          <StatusBadge status={pericia.status || 'Agendado'} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {[
                          'Agendado',
                          'Em Andamento',
                          'Laudo Entregue',
                          'Concluído',
                          'Pendente',
                          'Recusada',
                        ].map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleUpdateStatus(pericia.id, s)}
                          >
                            {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isParada(pericia) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="p-1 rounded-full bg-destructive/10 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Perícia sem movimentação há mais de 30 dias</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              )}
              <TableCell
                className="text-right pr-4 sm:pr-6 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => onEdit(pericia)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(pericia)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir Perícia</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
