import { useState, useEffect, useMemo } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertTriangle,
  FileText,
  Loader2,
  Clock,
  BellRing,
  CalendarPlus,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { downloadIcs } from '@/lib/ics'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type EventType = 'nomeacao' | 'pericia' | 'entrega' | 'impugnacao' | 'esclarecimentos'

interface CalendarEvent {
  id: string
  date: Date
  type: EventType
  title: string
  processo: string
  originalData: any
}

const fallbackData = [
  {
    id: 'mock-1',
    numero_processo: '1002345-67.2023.8.26.0100',
    data_nomeacao: new Date().toISOString(),
    data_pericia: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    data_entrega_laudo: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    vara: '1ª Vara Cível',
    cidade: 'São Paulo',
    observacoes: 'Perícia agendada com as partes. Requer acesso ao local.',
    status: 'Agendado',
  },
  {
    id: 'mock-2',
    numero_processo: '0011223-44.2023.5.02.0001',
    data_nomeacao: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    data_pericia: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    data_entrega_laudo: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    vara: '2ª Vara do Trabalho',
    cidade: 'Rio de Janeiro',
    observacoes: 'Aguardando envio de documentação complementar.',
    status: 'Em Andamento',
  },
]

const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
  if (!d) return null
  const parsed = new Date(d)
  if (isNaN(parsed.getTime())) return null
  // Use UTC shift to avoid timezone issues with plain YYYY-MM-DD
  return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
}

export default function Calendario() {
  const [pericias, setPericias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filterType, setFilterType] = useState<EventType | 'all'>('all')

  useEffect(() => {
    const fetchPericias = async () => {
      try {
        const { data, error } = await supabase.from('pericias').select('*')
        if (error) throw error

        if (!data || data.length === 0) {
          setPericias(fallbackData)
        } else {
          setPericias(data)
        }
      } catch (err) {
        console.error('Error fetching pericias:', err)
        setPericias(fallbackData)
      } finally {
        setLoading(false)
      }
    }
    fetchPericias()
  }, [])

  const events: CalendarEvent[] = useMemo(() => {
    const evts: CalendarEvent[] = []
    pericias.forEach((p) => {
      const processo =
        p.numero_processo || p.numeroProcesso || p.codigo_interno || p.codigoInterno || 'Sem Número'

      const dtNomeacao = parseDateSafe(p.data_nomeacao || p.dataNomeacao)
      if (dtNomeacao) {
        evts.push({
          id: `${p.id}-nom`,
          date: dtNomeacao,
          type: 'nomeacao',
          title: 'Nomeação',
          processo,
          originalData: p,
        })
      }

      const dtPericia = parseDateSafe(p.data_pericia || p.dataPericia)
      if (dtPericia) {
        evts.push({
          id: `${p.id}-per`,
          date: dtPericia,
          type: 'pericia',
          title: 'Visita Técnica',
          processo,
          originalData: p,
        })
      }

      const dtEntrega = parseDateSafe(p.data_entrega_laudo || p.dataEntregaLaudo)
      if (dtEntrega) {
        evts.push({
          id: `${p.id}-ent`,
          date: dtEntrega,
          type: 'entrega',
          title: 'Prazo do Laudo',
          processo,
          originalData: p,
        })
      }

      const dtImpugnacao = parseDateSafe(p.prazo_entrega || p.prazoEntrega)
      if (dtImpugnacao) {
        evts.push({
          id: `${p.id}-imp`,
          date: dtImpugnacao,
          type: 'impugnacao',
          title: 'Prazo Impugnação',
          processo,
          originalData: p,
        })
      }

      const dtEsclarecimentos = parseDateSafe(p.entrega_esclarecimentos || p.entregaEsclarecimentos)
      if (dtEsclarecimentos) {
        evts.push({
          id: `${p.id}-esc`,
          date: dtEsclarecimentos,
          type: 'esclarecimentos',
          title: 'Prazo Esclarecimentos',
          processo,
          originalData: p,
        })
      }
    })
    return evts.filter((e) => filterType === 'all' || e.type === filterType)
  }, [pericias, filterType])

  const isUrgent = (date: Date, status: string) => {
    if (status === 'Concluído' || status === 'Laudo Entregue') return false
    const now = new Date()
    const dateCopy = new Date(date)
    dateCopy.setHours(23, 59, 59, 999)
    const diffTime = dateCopy.getTime() - now.getTime()
    const diffHours = diffTime / (1000 * 3600)
    return diffHours >= 0 && diffHours <= 48
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const getEventsForDay = (day: Date) => events.filter((e) => isSameDay(e.date, day))

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'pericia':
        return <CalendarIcon className="w-3 h-3 mr-1" />
      case 'entrega':
      case 'impugnacao':
      case 'esclarecimentos':
        return <AlertTriangle className="w-3 h-3 mr-1" />
      case 'nomeacao':
        return <FileText className="w-3 h-3 mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Calendário
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas perícias e prazos importantes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filtrar eventos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              <SelectItem value="nomeacao">Apenas Nomeações</SelectItem>
              <SelectItem value="pericia">Visitas Técnicas</SelectItem>
              <SelectItem value="entrega">Prazos de Laudo</SelectItem>
              <SelectItem value="impugnacao">Prazos de Impugnação</SelectItem>
              <SelectItem value="esclarecimentos">Prazos de Esclarecimentos</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Hoje
            </Button>
            <div className="flex items-center border rounded-md overflow-hidden bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-36 text-center font-medium text-sm capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm mb-2">
        {(filterType === 'all' || filterType === 'nomeacao') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Nomeações</span>
          </div>
        )}
        {(filterType === 'all' || filterType === 'pericia') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-500 shadow-sm"></div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Visitas Técnicas</span>
          </div>
        )}
        {(filterType === 'all' || filterType === 'entrega') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Prazos de Laudo</span>
          </div>
        )}
        {(filterType === 'all' || filterType === 'impugnacao') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Impugnações</span>
          </div>
        )}
        {(filterType === 'all' || filterType === 'esclarecimentos') && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm"></div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Esclarecimentos</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <BellRing className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300 text-xs">
            Vence em &lt; 48h
          </span>
        </div>
      </div>

      <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div
                key={d}
                className="bg-zinc-50 dark:bg-zinc-900/80 py-3 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800">
            {days.map((day, i) => {
              const dayEvents = getEventsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (dayEvents.length > 0) setSelectedDate(day)
                  }}
                  className={cn(
                    'bg-white dark:bg-zinc-950 min-h-[120px] p-2 transition-colors relative group',
                    !isCurrentMonth &&
                      'text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 dark:text-zinc-600',
                    dayEvents.length > 0 &&
                      'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
                    isToday && 'bg-zinc-100/50 dark:bg-zinc-800/40',
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                        isToday && 'bg-primary text-primary-foreground shadow-sm',
                        !isToday &&
                          dayEvents.length > 0 &&
                          'group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800',
                        !isToday && !isCurrentMonth && 'opacity-50',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {dayEvents.slice(0, 3).map((e) => {
                      const urgent = isUrgent(e.date, e.originalData.status)
                      return (
                        <div
                          key={e.id}
                          className={cn(
                            'text-[11px] px-1.5 py-1 rounded-sm truncate font-medium flex items-center justify-between shadow-sm relative overflow-hidden group/event',
                            e.type === 'pericia'
                              ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/50'
                              : e.type === 'entrega'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                                : e.type === 'impugnacao'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50'
                                  : e.type === 'esclarecimentos'
                                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
                            urgent &&
                              'ring-1 ring-amber-400 dark:ring-amber-500 ring-offset-1 dark:ring-offset-zinc-950',
                          )}
                          title={`${e.title}: ${e.processo}${urgent ? ' (Vence em < 48h)' : ''}`}
                        >
                          <div className="flex items-center truncate">
                            {getEventIcon(e.type)}
                            <span className="truncate">{e.processo}</span>
                          </div>
                          {urgent && (
                            <BellRing className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 ml-1 animate-pulse" />
                          )}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-zinc-500 font-medium pl-1 mt-1">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Agenda do Dia</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              {selectedDate
                ? format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-2">
            {selectedDate && getEventsForDay(selectedDate).length > 0 ? (
              <div className="space-y-3 pr-4 pb-4">
                {getEventsForDay(selectedDate).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50 shadow-sm relative',
                      isUrgent(e.date, e.originalData.status) &&
                        'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-xs px-2 py-0.5 font-semibold shadow-sm',
                            e.type === 'pericia'
                              ? 'bg-zinc-600 hover:bg-zinc-700 text-white'
                              : e.type === 'entrega'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : e.type === 'impugnacao'
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : e.type === 'esclarecimentos'
                                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                                    : 'bg-purple-500 hover:bg-purple-600 text-white',
                          )}
                        >
                          {e.title}
                        </Badge>
                        {isUrgent(e.date, e.originalData.status) && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950"
                          >
                            <Clock className="w-3 h-3 mr-1" /> Vence em &lt; 48h
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {e.originalData.status && (
                          <Badge variant="secondary" className="text-[10px]">
                            {e.originalData.status}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                          title="Adicionar à Agenda"
                          onClick={() => {
                            downloadIcs({
                              title: `${e.title} - Proc: ${e.processo}`,
                              description: `Processo: ${e.processo}\nStatus: ${e.originalData.status || ''}\nVara: ${e.originalData.vara || ''}\nObservações: ${e.originalData.observacoes || ''}`,
                              location: e.originalData.endereco || e.originalData.cidade || '',
                              startDate: e.date,
                              allDay: true,
                            })
                          }}
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        Processo: {e.processo}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {e.originalData.vara || 'Vara não informada'}
                        {e.originalData.cidade ? ` - ${e.originalData.cidade}` : ''}
                      </div>
                    </div>
                    {e.originalData.observacoes && (
                      <div className="text-xs bg-white dark:bg-zinc-950 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 italic line-clamp-3">
                        {e.originalData.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento agendado para este dia.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
