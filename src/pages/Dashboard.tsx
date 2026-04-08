import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usePericias } from '@/contexts/PericiasContext'
import { useLancamentos } from '@/hooks/use-lancamentos'
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { differenceInDays } from 'date-fns'
import {
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pericia } from '@/lib/types'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { pericias } = usePericias()
  const { lancamentos } = useLancamentos()

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
    const data = months.map((m) => ({ month: m, receitas: 0, despesas: 0, saldo: 0 }))

    lancamentos.forEach((l) => {
      const date = new Date(l.data)
      if (!isNaN(date.getTime()) && (l.status === 'recebido' || l.status === 'pago')) {
        const idx = date.getMonth()
        if (l.tipo === 'receita') {
          data[idx].receitas += Number(l.valor) || 0
        } else {
          data[idx].despesas += Number(l.valor) || 0
        }
      }
    })

    data.forEach((d) => {
      d.saldo = d.receitas - d.despesas
    })

    const currentMonth = new Date().getMonth()
    const startIndex = (currentMonth - 5 + 12) % 12
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(data[(startIndex + i) % 12])
    }
    return result
  }, [lancamentos])

  const kpis = useMemo(() => {
    let receitas = 0
    let despesas = 0

    lancamentos.forEach((l) => {
      const valor = Number(l.valor) || 0
      if (l.tipo === 'receita' && (l.status === 'recebido' || l.status === 'pago'))
        receitas += valor
      if (l.tipo === 'despesa' && (l.status === 'recebido' || l.status === 'pago'))
        despesas += valor
    })

    return { receitas, despesas, saldo: receitas - despesas }
  }, [lancamentos])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
    if (!d) return null
    const parsed = new Date(d)
    if (isNaN(parsed.getTime())) return null
    return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
  }

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
        if (diff < 0) {
          alerts.push({
            id: `${p.id}-${title}`,
            pericia: p,
            title,
            days: Math.abs(diff),
            type: 'atrasado',
          })
        } else if (diff <= 7) {
          alerts.push({ id: `${p.id}-${title}`, pericia: p, title, days: diff, type: 'proximo' })
        }
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

  const pendingPericias = pericias.filter(
    (p) => p.status === 'Pendente' || p.status === 'Em Andamento',
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumo financeiro e acompanhamento de prazos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${kpis.saldo >= 0 ? 'text-primary' : 'text-destructive'}`}
            >
              {formatCurrency(kpis.saldo)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Realizadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(kpis.receitas)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Realizadas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(kpis.despesas)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="shadow-sm lg:col-span-4">
          <CardHeader>
            <CardTitle>Balanço Mensal (Últimos 6 meses)</CardTitle>
            <CardDescription>Comparativo de Receitas e Despesas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                receitas: { label: 'Receitas', color: 'hsl(var(--primary))' },
                despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${v}`}
                    width={80}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receitas" fill="var(--color-receitas)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="var(--color-despesas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Prazos e Alertas
            </CardTitle>
            <CardDescription>Perícias com prazos críticos.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
                <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500/50" />
                <p>Nenhum prazo crítico no momento.</p>
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
                      <p className="text-sm font-medium leading-none">{notif.title}</p>
                      <Badge
                        variant={notif.type === 'atrasado' ? 'destructive' : 'outline'}
                        className={
                          notif.type === 'proximo' ? 'text-amber-500 border-amber-500/50' : ''
                        }
                      >
                        {notif.type === 'atrasado'
                          ? `Atrasado ${notif.days}d`
                          : notif.days === 0
                            ? 'Vence hoje'
                            : `Em ${notif.days}d`}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-col">
                      <span>Proc: {notif.pericia.numeroProcesso || 'S/N'}</span>
                      <Link
                        to="/pericias"
                        className="text-primary hover:underline mt-1 font-medium"
                      >
                        Ver Perícia
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Perícias em Andamento / Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPericias.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma perícia em andamento.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingPericias.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to="/pericias"
                  className="flex flex-col p-4 rounded-lg border hover:border-primary/50 transition-colors bg-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{p.codigoInterno}</span>
                    <Badge variant="secondary" className="text-xs">
                      {p.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mb-1 truncate">
                    Processo: {p.numeroProcesso}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">Vara: {p.vara}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
