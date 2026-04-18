import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts'
import { Pericia, Lancamento } from '@/lib/types'
import { parseDateSafe, getKey, usePeriodsConfig } from './utils'

interface DashboardFinancialChartsProps {
  pericias: Pericia[]
  lancamentos: Lancamento[]
  allDocs: any[]
  dashboardPeriod: '6m' | '12m' | 'ytd'
}

export function DashboardFinancialCharts({
  pericias,
  lancamentos,
  allDocs,
  dashboardPeriod,
}: DashboardFinancialChartsProps) {
  const periodsConfig = usePeriodsConfig(dashboardPeriod)

  const produtividadeHistoricaData = useMemo(() => {
    const data = periodsConfig.map((p) => ({
      ...p,
      nomeacoes: 0,
      aceites: 0,
      laudosEntregues: 0,
      honorarios: 0,
    }))

    pericias.forEach((p) => {
      const keyNomeacao = getKey(parseDateSafe(p.dataNomeacao))
      const mNomeacao = data.find((m) => m.key === keyNomeacao)
      if (mNomeacao) mNomeacao.nomeacoes += 1

      if (p.status === 'Concluído') {
        const keyConclusao = getKey(
          parseDateSafe(p.dataEntregaLaudo) || parseDateSafe(p.dataPericia),
        )
        const mConclusao = data.find((m) => m.key === keyConclusao)
        if (mConclusao) mConclusao.laudosEntregues += 1
      }
    })

    allDocs.forEach((doc) => {
      const key = getKey(parseDateSafe(doc.created_at))
      const mDoc = data.find((m) => m.key === key)
      if (mDoc && doc.tipo_documento === 'Petição') {
        if (
          doc.nome_documento.toLowerCase().includes('aceite') ||
          doc.nome_documento.toLowerCase().includes('proposta')
        ) {
          mDoc.aceites += 1
        } else {
          mDoc.aceites += 0.5
        }
      }
    })

    lancamentos.forEach((l) => {
      if (l.tipo === 'receita' && (l.status === 'recebido' || l.status === 'pago')) {
        const key = getKey(parseDateSafe(l.data))
        const m = data.find((m) => m.key === key)
        if (m) m.honorarios += Number(l.valor) || 0
      }
    })

    return data.map((m) => ({ ...m, aceites: Math.floor(m.aceites) }))
  }, [pericias, allDocs, lancamentos, periodsConfig])

  const chartData = useMemo(() => {
    const data = periodsConfig.map((p) => ({ ...p, receitas: 0, despesas: 0, saldo: 0 }))
    lancamentos.forEach((l) => {
      const key = getKey(parseDateSafe(l.data))
      const m = data.find((x) => x.key === key)
      if (m && (l.status === 'recebido' || l.status === 'pago')) {
        if (l.tipo === 'receita') m.receitas += Number(l.valor) || 0
        else m.despesas += Number(l.valor) || 0
      }
    })
    return data.map((d) => ({ ...d, saldo: d.receitas - d.despesas, month: d.label }))
  }, [lancamentos, periodsConfig])

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Produtividade Histórica e Honorários</CardTitle>
          <CardDescription>
            Visão consolidada de nomeações, aceites, entregas e honorários recebidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              nomeacoes: { label: 'Nomeações', color: '#3b82f6' },
              aceites: { label: 'Aceites', color: '#8b5cf6' },
              laudosEntregues: { label: 'Laudos Entregues', color: '#10b981' },
              honorarios: { label: 'Honorários (R$)', color: '#f59e0b' },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={produtividadeHistoricaData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$ ${v}`}
                  width={80}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="nomeacoes"
                  fill="var(--color-nomeacoes)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  yAxisId="left"
                  dataKey="aceites"
                  fill="var(--color-aceites)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  yAxisId="left"
                  dataKey="laudosEntregues"
                  fill="var(--color-laudosEntregues)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="honorarios"
                  stroke="var(--color-honorarios)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Balanço Financeiro</CardTitle>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
    </div>
  )
}
