import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, FileText, Clock, AlertCircle, CheckCircle2, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Pericia } from '@/lib/types'
import { parseDateSafe } from './utils'
import { differenceInDays } from 'date-fns'

export function DashboardActivities({
  pericias,
  allDocs,
}: {
  pericias: Pericia[]
  allDocs: any[]
}) {
  const [showHistory, setShowHistory] = useState(false)
  const recentDocs = useMemo(() => allDocs.slice(0, 10), [allDocs])

  const notifications = useMemo(() => {
    const alerts: {
      id: string
      pericia: Pericia
      title: string
      days: number
      type: 'atrasado' | 'proximo'
    }[] = []
    pericias.forEach((p) => {
      if (p.status === 'Concluído') return
      const checkDeadline = (dateStr: string | undefined | null, title: string) => {
        const date = parseDateSafe(dateStr)
        if (!date) return
        const diff = differenceInDays(date, new Date())
        if (diff < 0)
          alerts.push({
            id: `${p.id}-${title}`,
            pericia: p,
            title,
            days: Math.abs(diff),
            type: 'atrasado',
          })
        else if (diff <= 7)
          alerts.push({ id: `${p.id}-${title}`, pericia: p, title, days: diff, type: 'proximo' })
      }
      checkDeadline(p.dataEntregaLaudo, 'Entrega do Laudo')
      checkDeadline(p.entregaImpugnacao, 'Entrega de Impugnação')
      checkDeadline(p.entregaEsclarecimentos, 'Entrega de Esclarecimentos')
    })
    return alerts.sort((a, b) => {
      if (a.type === 'atrasado' && b.type !== 'atrasado') return -1
      if (b.type === 'atrasado' && a.type !== 'atrasado') return 1
      return a.days - b.days
    })
  }, [pericias])

  const pendingPericias = useMemo(() => {
    return pericias
      .filter((p) => ['Pendente', 'Em Andamento', 'Agendado'].includes(p.status))
      .map((p) => {
        let daysToDeadline: number | null = null
        let deadlineName = ''
        const checkDate = (dateStr: string | undefined | null, name: string) => {
          const d = parseDateSafe(dateStr)
          if (d) {
            const diff = differenceInDays(d, new Date())
            if (daysToDeadline === null || diff < daysToDeadline) {
              daysToDeadline = diff
              deadlineName = name
            }
          }
        }
        checkDate(p.dataEntregaLaudo, 'Laudo')
        checkDate(p.entregaImpugnacao, 'Contestação')
        checkDate(p.entregaEsclarecimentos, 'Esclarecimentos')

        let priority: 'urgente' | 'atencao' | 'normal' | 'atrasado' = 'normal'
        if (daysToDeadline !== null) {
          if (daysToDeadline < 0) priority = 'atrasado'
          else if (daysToDeadline <= 2) priority = 'urgente'
          else if (daysToDeadline <= 7) priority = 'atencao'
        }
        return { ...p, daysToDeadline, priority, deadlineName }
      })
      .sort((a, b) => {
        const order = { atrasado: 0, urgente: 1, atencao: 2, normal: 3 }
        const diff = order[a.priority] - order[b.priority]
        if (diff !== 0) return diff
        return (a.daysToDeadline ?? 999) - (b.daysToDeadline ?? 999)
      })
  }, [pericias])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="shadow-sm flex flex-col h-[400px]">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Documentos Recentes
            </CardTitle>
            <CardDescription>Últimas petições e laudos.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
              <FileText className="w-12 h-12 mb-2 opacity-50" />
              <p>Nenhum documento gerado.</p>
            </div>
          ) : (
            recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1 space-y-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{doc.nome_documento}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Proc: {doc.pericia?.numero_processo || 'S/N'}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Prazos e Alertas
          </CardTitle>
          <CardDescription>Perícias com prazos críticos.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
              <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500/50" />
              <p>Nenhum prazo crítico.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">
                  {notif.type === 'atrasado' ? (
                    <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <Badge
                      variant={notif.type === 'atrasado' ? 'destructive' : 'outline'}
                      className={notif.type === 'proximo' ? 'text-amber-500 border-amber-500' : ''}
                    >
                      {notif.type === 'atrasado'
                        ? `Atrasado ${notif.days}d`
                        : notif.days === 0
                          ? 'Vence hoje'
                          : `Em ${notif.days}d`}
                    </Badge>
                  </div>
                  <div className="text-xs flex flex-col">
                    <span className="text-muted-foreground">
                      Proc: {notif.pericia.numeroProcesso || 'S/N'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm flex flex-col h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Prioridade de Entregas
          </CardTitle>
          <CardDescription>Perícias pendentes organizadas por prazo.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-2">
          {pendingPericias.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
              <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500/50" />
              <p>Nenhuma perícia pendente.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingPericias.map((p) => (
                <Link
                  key={p.id}
                  to="/pericias"
                  className={`flex flex-col p-3 rounded-lg border bg-card ${p.priority === 'atrasado' ? 'border-destructive/50 bg-destructive/10' : p.priority === 'urgente' ? 'border-red-500/50 bg-red-500/10' : p.priority === 'atencao' ? 'border-amber-500/50 bg-amber-500/10' : 'hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-semibold text-sm truncate">
                      {p.numeroProcesso || p.codigoInterno || 'S/ Código'}
                    </span>
                    <div className="shrink-0">
                      {p.priority === 'atrasado' && (
                        <Badge variant="destructive" className="text-[10px]">
                          Atrasado ({Math.abs(p.daysToDeadline!)}d)
                        </Badge>
                      )}
                      {p.priority === 'urgente' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-red-500 text-white border-red-500"
                        >
                          Urgente ({p.daysToDeadline}d)
                        </Badge>
                      )}
                      {p.priority === 'atencao' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-500 text-white border-amber-500"
                        >
                          Atenção ({p.daysToDeadline}d)
                        </Badge>
                      )}
                      {p.priority === 'normal' && (
                        <Badge variant="secondary" className="text-[10px]">
                          {p.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span className="truncate mr-2">Vara: {p.vara}</span>
                    {p.deadlineName && (
                      <span className="font-medium text-foreground shrink-0">{p.deadlineName}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
