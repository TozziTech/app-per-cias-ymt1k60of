import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
} from 'recharts'
import { Timer } from 'lucide-react'
import { Pericia } from '@/lib/types'
import { parseDateSafe, getKey, usePeriodsConfig } from './utils'
import { differenceInDays } from 'date-fns'

export function DashboardProductivityCharts({
  pericias,
  allDocs,
  dashboardPeriod,
}: {
  pericias: Pericia[]
  allDocs: any[]
  dashboardPeriod: any
}) {
  const periodsConfig = usePeriodsConfig(dashboardPeriod)

  const periciasChartData = useMemo(() => {
    const data = periodsConfig.map((p) => ({ ...p, concluidas: 0, novas: 0 }))
    pericias.forEach((p) => {
      const mNova = data.find((x) => x.key === getKey(parseDateSafe(p.dataNomeacao)))
      if (mNova) mNova.novas += 1
      if (p.status === 'Concluído') {
        const mConcluida = data.find(
          (x) =>
            x.key === getKey(parseDateSafe(p.dataEntregaLaudo) || parseDateSafe(p.dataPericia)),
        )
        if (mConcluida) mConcluida.concluidas += 1
      }
    })
    return data.map((d) => ({ ...d, month: d.label }))
  }, [pericias, periodsConfig])

  const produtividadeDocsData = useMemo(() => {
    const data = periodsConfig.map((p) => ({ ...p, peticoes: 0, laudos: 0 }))
    allDocs.forEach((doc) => {
      const m = data.find((x) => x.key === getKey(parseDateSafe(doc.created_at)))
      if (m) {
        if (doc.tipo_documento === 'Laudo/Relatório') m.laudos += 1
        else m.peticoes += 1
      }
    })
    return data.map((d) => ({ ...d, month: d.label }))
  }, [allDocs, periodsConfig])

  const leadTimeData = useMemo(() => {
    let stats = {
      nomeacao: { total: 0, count: 0 },
      aceite: { total: 0, count: 0 },
      pericia: { total: 0, count: 0 },
      impugnacao: { total: 0, count: 0 },
      esclar: { total: 0, count: 0 },
      pgto: { total: 0, count: 0 },
    }

    pericias.forEach((p) => {
      const d = [
        p.dataNomeacao,
        p.dataAceite,
        p.dataPericia,
        p.dataEntregaLaudo,
        p.dataImpugnacao,
        p.entregaEsclarecimentos,
        p.dataPagamento,
      ].map(parseDateSafe)

      if (d[0] && d[1]) {
        stats.nomeacao.total += Math.max(0, differenceInDays(d[1], d[0]))
        stats.nomeacao.count++
      }
      if (d[1] && d[2]) {
        stats.aceite.total += Math.max(0, differenceInDays(d[2], d[1]))
        stats.aceite.count++
      }
      if (d[2] && d[3]) {
        stats.pericia.total += Math.max(0, differenceInDays(d[3], d[2]))
        stats.pericia.count++
      }
      if (d[3] && d[4]) {
        stats.impugnacao.total += Math.max(0, differenceInDays(d[4], d[3]))
        stats.impugnacao.count++
      }
      if (d[4] && d[5]) {
        stats.esclar.total += Math.max(0, differenceInDays(d[5], d[4]))
        stats.esclar.count++
      }
      if (d[5] && d[6]) {
        stats.pgto.total += Math.max(0, differenceInDays(d[6], d[5]))
        stats.pgto.count++
      }
    })

    const avg = (s: { total: number; count: number }) =>
      s.count ? Math.round(s.total / s.count) : 0
    return [
      { etapa: 'Nomeação → Aceite', dias: avg(stats.nomeacao) },
      { etapa: 'Aceite → Perícia', dias: avg(stats.aceite) },
      { etapa: 'Perícia → Laudo', dias: avg(stats.pericia) },
      { etapa: 'Laudo → Contestação', dias: avg(stats.impugnacao) },
      { etapa: 'Contest. → Esclar.', dias: avg(stats.esclar) },
      { etapa: 'Esclar. → Pagamento', dias: avg(stats.pgto) },
    ]
  }, [pericias])

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Produtividade de Perícias</CardTitle>
            <CardDescription>Comparativo de Novas vs Concluídas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                concluidas: { label: 'Concluídas', color: '#10b981' },
                novas: { label: 'Novas', color: '#3b82f6' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={periciasChartData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="novas"
                    stroke="var(--color-novas)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="concluidas"
                    stroke="var(--color-concluidas)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Documentos Entregues</CardTitle>
            <CardDescription>Volume mensal de produção.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                peticoes: { label: 'Petições', color: '#8b5cf6' },
                laudos: { label: 'Laudos', color: '#f59e0b' },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={produtividadeDocsData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="peticoes"
                    stackId="a"
                    fill="var(--color-peticoes)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="laudos"
                    stackId="a"
                    fill="var(--color-laudos)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" /> Lead Time Médio por Etapa
          </CardTitle>
          <CardDescription>
            Tempo médio em dias transcorridos entre os principais marcos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{ dias: { label: 'Dias (Média)', color: '#0ea5e9' } }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadTimeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="etapa"
                  type="category"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                />
                <Bar dataKey="dias" fill="var(--color-dias)" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  )
}
