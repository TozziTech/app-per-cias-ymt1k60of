import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Pericia } from '@/lib/types'
import { format, subMonths, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, CalendarDays, ClipboardCheck, TrendingUp } from 'lucide-react'

interface DashboardProdutividadeProps {
  pericias: Pericia[]
}

export function DashboardProdutividade({ pericias }: DashboardProdutividadeProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let vistoriasAgendadasMes = 0
    let checklistsConcluidosMes = 0
    let laudosEntreguesMes = 0

    pericias.forEach((p) => {
      if (p.dataPericia) {
        const dataPericia = new Date(p.dataPericia)
        const tzFixed = new Date(dataPericia.getTime() + dataPericia.getTimezoneOffset() * 60000)

        if (tzFixed.getMonth() === currentMonth && tzFixed.getFullYear() === currentYear) {
          vistoriasAgendadasMes++
          const hasChecklist = p.checklist && p.checklist.length > 0
          const checklistCompleto = hasChecklist && p.checklist.every((item) => item.concluido)
          if (checklistCompleto) {
            checklistsConcluidosMes++
          }
        }
      }

      if (p.status === 'Concluído' || p.status === 'Laudo Entregue') {
        const dataStr = p.dataEntregaLaudo || p.updated_at
        if (dataStr) {
          const dataRef = new Date(dataStr)
          const tzFixedRef = new Date(dataRef.getTime() + dataRef.getTimezoneOffset() * 60000)
          if (tzFixedRef.getMonth() === currentMonth && tzFixedRef.getFullYear() === currentYear) {
            laudosEntreguesMes++
          }
        }
      }
    })

    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStr = format(monthDate, 'MMM/yy', { locale: ptBR })

      let concluidas = 0
      let vistorias = 0

      pericias.forEach((p) => {
        if (p.status === 'Concluído' || p.status === 'Laudo Entregue') {
          const dataStr = p.dataEntregaLaudo || p.updated_at
          if (dataStr) {
            const dataRef = new Date(dataStr)
            const tzFixedRef = new Date(dataRef.getTime() + dataRef.getTimezoneOffset() * 60000)
            if (isSameMonth(tzFixedRef, monthDate)) {
              concluidas++
            }
          }
        }
        if (p.dataPericia) {
          const dPericia = new Date(p.dataPericia)
          const tzFixed = new Date(dPericia.getTime() + dPericia.getTimezoneOffset() * 60000)
          if (isSameMonth(tzFixed, monthDate)) {
            const isCompleto =
              p.checklist && p.checklist.length > 0 && p.checklist.every((item) => item.concluido)
            if (isCompleto) vistorias++
          }
        }
      })

      chartData.push({
        name: monthStr,
        concluidas,
        vistorias,
      })
    }

    return {
      vistoriasAgendadasMes,
      checklistsConcluidosMes,
      laudosEntreguesMes,
      chartData,
    }
  }, [pericias])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistorias no Mês</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vistoriasAgendadasMes}</div>
            <p className="text-xs text-muted-foreground mt-1">Vistorias agendadas para este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists Concluídos</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checklistsConcluidosMes}</div>
            <p className="text-xs text-muted-foreground mt-1">Checklists 100% finalizados no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laudos Entregues</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.laudosEntreguesMes}</div>
            <p className="text-xs text-muted-foreground mt-1">Perícias concluídas este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.vistoriasAgendadasMes > 0
                ? Math.round((stats.checklistsConcluidosMes / stats.vistoriasAgendadasMes) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vistorias com checklist finalizado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Produtividade (6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                concluidas: { label: 'Laudos Entregues', color: 'hsl(var(--primary))' },
                vistorias: { label: 'Vistorias Concluídas', color: 'hsl(var(--emerald-500))' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar
                    dataKey="vistorias"
                    name="Vistorias Concluídas"
                    fill="hsl(var(--emerald-500))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="concluidas"
                    name="Laudos Entregues"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
