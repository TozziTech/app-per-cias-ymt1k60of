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
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
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

type EventType = 'nomeacao' | 'pericia' | 'entrega'

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
    data_pericia: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    data_entrega_laudo: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    vara: '1ª Vara Cível',
    cidade: 'São Paulo',
    observacoes: 'Perícia agendada com as partes. Requer acesso ao local.',
  },
  {
    id: 'mock-2',
    numero_processo: '0011223-44.2023.5.02.0001',
    data_nomeacao: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    data_pericia: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    data_entrega_laudo: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    vara: '2ª Vara do Trabalho',
    cidade: 'Rio de Janeiro',
    observacoes: 'Aguardando envio de documentação complementar.',
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
    })
    return evts
  }, [pericias])

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendário
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas perícias e prazos importantes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>
            Hoje
          </Button>
          <div className="flex items-center border rounded-md overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-none hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="h-9 w-9 rounded-none hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Nomeações</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Visitas Técnicas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Prazos de Laudo</span>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div
                key={d}
                className="bg-slate-50 dark:bg-slate-900/80 py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800">
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
                    'bg-white dark:bg-slate-950 min-h-[120px] p-2 transition-colors relative group',
                    !isCurrentMonth &&
                      'text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-600',
                    dayEvents.length > 0 &&
                      'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900',
                    isToday && 'bg-blue-50/30 dark:bg-blue-900/20',
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                        isToday && 'bg-primary text-primary-foreground shadow-sm',
                        !isToday &&
                          dayEvents.length > 0 &&
                          'group-hover:bg-slate-200 dark:group-hover:bg-slate-800',
                        !isToday && !isCurrentMonth && 'opacity-50',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className={cn(
                          'text-[11px] px-1.5 py-1 rounded-sm truncate font-medium flex items-center shadow-sm',
                          e.type === 'pericia'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                            : e.type === 'entrega'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
                        )}
                        title={`${e.title}: ${e.processo}`}
                      >
                        {getEventIcon(e.type)}
                        <span className="truncate">{e.processo}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-500 font-medium pl-1 mt-1">
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
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        className={cn(
                          'text-xs px-2 py-0.5 font-semibold shadow-sm',
                          e.type === 'pericia'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : e.type === 'entrega'
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-purple-500 hover:bg-purple-600 text-white',
                        )}
                      >
                        {e.title}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                        Processo: {e.processo}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {e.originalData.vara || 'Vara não informada'}
                        {e.originalData.cidade ? ` - ${e.originalData.cidade}` : ''}
                      </div>
                    </div>
                    {e.originalData.observacoes && (
                      <div className="text-xs bg-white dark:bg-slate-950 p-2.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic line-clamp-3">
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
