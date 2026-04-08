import { useAuth } from '@/contexts/AuthContext'
import { usePericias } from '@/contexts/PericiasContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle2, Clock, FileText, Bell, History } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { isBefore, addDays, parseISO, format } from 'date-fns'

const chartData = [
  { month: 'Jan', pericias: 12 },
  { month: 'Fev', pericias: 18 },
  { month: 'Mar', pericias: 15 },
  { month: 'Abr', pericias: 22 },
  { month: 'Mai', pericias: 30 },
  { month: 'Jun', pericias: 25 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { pericias } = usePericias()
  const [logs, setLogs] = useState<any[]>([])

  const isAdmin = user?.role === 'admin' || user?.role === 'administrador'

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*, profiles:user_id(name)')
        .order('created_at', { ascending: false })
        .limit(6)
      if (data) setLogs(data)
    }
    fetchLogs()
  }, [])

  const dashboardPericias = isAdmin
    ? pericias
    : pericias.filter(
        (p) =>
          (p.peritoAssociado || (p as any).perito_associado) &&
          user?.name &&
          (p.peritoAssociado || (p as any).perito_associado)
            .toLowerCase()
            .includes(user.name.toLowerCase()),
      )

  const stats = {
    total: dashboardPericias.length,
    pendentes: dashboardPericias.filter((p) => p.status === 'Pendente').length,
    emAndamento: dashboardPericias.filter((p) => p.status === 'Em Andamento').length,
    concluidas: dashboardPericias.filter((p) => p.status === 'Concluído').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>
      case 'Em Andamento':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          >
            Em Andamento
          </Badge>
        )
      case 'Pendente':
        return (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
          >
            Pendente
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const nextWeek = addDays(new Date(), 7)
  const notificacoes = dashboardPericias
    .filter((p) => {
      const prazoStr = p.prazoEntrega || (p as any).prazo_entrega
      if (p.status === 'Concluído' || !prazoStr) return false
      return isBefore(parseISO(prazoStr), nextWeek)
    })
    .sort((a, b) => {
      const aPrazo = a.prazoEntrega || (a as any).prazo_entrega
      const bPrazo = b.prazoEntrega || (b as any).prazo_entrega
      return new Date(aPrazo).getTime() - new Date(bPrazo).getTime()
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo,{' '}
          <span className="font-semibold text-foreground capitalize">
            {user?.role?.replace('_', ' ') || 'Usuário'}
          </span>
          . Aqui está o resumo das {isAdmin ? 'suas atividades' : 'suas perícias'}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Perícias Ativas</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total de Perícias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ pericias: { label: 'Perícias', color: 'hsl(var(--primary))' } }}
              className="h-[250px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pericias" fill="var(--color-pericias)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-amber-200 dark:border-amber-900/50">
          <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <Bell className="h-5 w-5" /> Notificações e Prazos
            </CardTitle>
            <CardDescription>Perícias vencendo nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {notificacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum prazo próximo.
              </p>
            ) : (
              notificacoes.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {n.numeroProcesso || (n as any).numero_processo || 'Sem número'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Prazo: {n.prazoEntrega ? format(parseISO(n.prazoEntrega), 'dd/MM/yyyy') : ''}
                    </p>
                  </div>
                  {getStatusBadge(n.status || 'Pendente')}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" /> Logs de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atividade recente.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm leading-none">
                      <span className="font-medium">{log.profiles?.name || 'Usuário'}</span>{' '}
                      <span className="text-muted-foreground">
                        {log.action} {log.entity_type}
                      </span>{' '}
                      <span className="font-medium">
                        {log.details?.numero_processo || log.details?.descricao || ''}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Perícias Recentes (Geral)' : 'Minhas Perícias Recentes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dashboardPericias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma perícia encontrada.
              </p>
            ) : (
              dashboardPericias.slice(0, 4).map((pericia) => (
                <div key={pericia.id} className="flex items-center">
                  <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {pericia.numeroProcesso ||
                        (pericia as any).numero_processo ||
                        'Processo sem número'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {pericia.peritoAssociado ||
                        (pericia as any).perito_associado ||
                        'Sem responsável'}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {getStatusBadge(pericia.status || 'Pendente')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
