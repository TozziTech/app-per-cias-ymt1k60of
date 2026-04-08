import { useAuth } from '@/contexts/AuthContext'
import { usePericias } from '@/contexts/PericiasContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'

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

  const isAdmin = user?.role === 'admin' || user?.role === 'administrador'

  // Filter pericias for the specific user if not admin
  const dashboardPericias = isAdmin
    ? pericias
    : pericias.filter(
        (p) =>
          p.perito_associado &&
          user?.name &&
          p.perito_associado.toLowerCase().includes(user.name.toLowerCase()),
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perícias Ativas</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando ação</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidas}</div>
            <p className="text-xs text-muted-foreground">Total finalizado</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Perícias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registros ativos</p>
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
              className="h-[300px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pericias" fill="var(--color-pericias)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Atividade Recente (Geral)' : 'Minhas Perícias Recentes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                        {pericia.numero_processo || 'Processo sem número'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {pericia.perito_associado || 'Sem responsável'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {getStatusBadge(pericia.status || 'Pendente')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
