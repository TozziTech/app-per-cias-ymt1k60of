import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePericias } from '@/contexts/PericiasContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Clock, Wallet, CheckCircle, Activity } from 'lucide-react'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function Financeiro() {
  const { user } = useAuth()
  const { pericias } = usePericias()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const kpis = useMemo(() => {
    let recebido = 0
    let aReceber = 0
    let emAndamento = 0

    pericias.forEach((p) => {
      const valor = p.honorarios || 0
      const status = p.status?.toLowerCase() || ''

      if (status === 'recebido') {
        recebido += valor
      } else if (status === 'laudo entregue') {
        aReceber += valor
      } else {
        emAndamento += valor
      }
    })

    return { recebido, aReceber, emAndamento, total: recebido + aReceber + emAndamento }
  }, [pericias])

  const recentTransactions = useMemo(() => {
    return [...pericias]
      .filter(
        (p) =>
          (p.status?.toLowerCase() === 'recebido' ||
            p.status?.toLowerCase() === 'laudo entregue') &&
          p.honorarios,
      )
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
  }, [pericias])

  const chartData = useMemo(() => {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]
    const data = months.map((m) => ({ month: m, recebido: 0, aReceber: 0 }))

    pericias.forEach((p) => {
      const dateStr = p.data_pericia || p.created_at
      if (dateStr) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth()
          const valor = p.honorarios || 0
          const status = p.status?.toLowerCase() || ''

          if (status === 'recebido') {
            data[monthIndex].recebido += valor
          } else if (status === 'laudo entregue') {
            data[monthIndex].aReceber += valor
          }
        }
      }
    })

    const currentMonth = new Date().getMonth()
    const startIndex = (currentMonth - 5 + 12) % 12

    const result = []
    for (let i = 0; i < 6; i++) {
      const index = (startIndex + i) % 12
      result.push(data[index])
    }

    return result
  }, [pericias])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Visão geral dos honorários e recebimentos das suas perícias.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(kpis.recebido)}
            </div>
            <p className="text-xs text-muted-foreground">Honorários já liquidados</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(kpis.aReceber)}</div>
            <p className="text-xs text-muted-foreground">Status: Laudo Entregue</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsto (Em Andamento)</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(kpis.emAndamento)}
            </div>
            <p className="text-xs text-muted-foreground">Perícias pendentes ou agendadas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.total)}</div>
            <p className="text-xs text-muted-foreground">Soma de todos os processos ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Receitas por Mês</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                recebido: { label: 'Recebido', color: 'hsl(var(--primary))' },
                aReceber: { label: 'A Receber', color: 'hsl(var(--chart-2))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value}`}
                  width={80}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="recebido"
                  stackId="a"
                  fill="var(--color-recebido)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="aReceber"
                  stackId="a"
                  fill="var(--color-aReceber)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Últimos Movimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((pericia) => (
                  <div key={pericia.id} className="flex items-center">
                    <div
                      className={cn(
                        'mr-4 flex h-9 w-9 items-center justify-center rounded-full border',
                        pericia.status?.toLowerCase() === 'recebido'
                          ? 'bg-emerald-50 border-emerald-100'
                          : 'bg-blue-50 border-blue-100',
                      )}
                    >
                      {pericia.status?.toLowerCase() === 'recebido' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate">
                        {pericia.numero_processo || 'Processo sem número'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {pericia.vara || 'Vara não informada'}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      <div className="font-medium text-sm">
                        {formatCurrency(pericia.honorarios || 0)}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-1 text-[10px] h-4 leading-none py-0.5 px-1.5',
                          pericia.status?.toLowerCase() === 'recebido'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-blue-300 bg-blue-50 text-blue-700',
                        )}
                      >
                        {pericia.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
                  Nenhum honorário finalizado recentemente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
