import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts'
import { Pericia, Lancamento } from '@/lib/types'

export function DashboardPeritoCharts({
  pericias,
  lancamentos,
}: {
  pericias: Pericia[]
  lancamentos: Lancamento[]
}) {
  const globaisAceitasRecusadas = useMemo(() => {
    let aceitas = 0
    let recusadas = 0
    pericias.forEach((p) => {
      if (p.aceite === 'Aceito') aceitas++
      if (p.aceite === 'Recusado' || p.status === 'Recusada') recusadas++
    })
    return [
      { name: 'Aceitas', value: aceitas, fill: '#10b981' },
      { name: 'Recusadas', value: recusadas, fill: '#a855f7' },
    ].filter((d) => d.value > 0)
  }, [pericias])

  const peritosStats = useMemo(() => {
    const stats: Record<
      string,
      { nome: string; nomeacoes: number; aceites: number; recusadas: number; recebido: number }
    > = {}
    pericias.forEach((p) => {
      const nome = p.peritoAssociado || 'Sem Perito'
      if (!stats[nome]) stats[nome] = { nome, nomeacoes: 0, aceites: 0, recusadas: 0, recebido: 0 }
      stats[nome].nomeacoes += 1
      if (p.aceite === 'Aceito') stats[nome].aceites += 1
      if (p.aceite === 'Recusado' || p.status === 'Recusada') stats[nome].recusadas += 1
    })
    lancamentos.forEach((l) => {
      if (l.tipo === 'receita' && (l.status === 'recebido' || l.status === 'pago')) {
        const p = pericias.find((per) => per.id === l.pericia_id)
        const nome = p?.peritoAssociado || 'Sem Perito'
        if (!stats[nome])
          stats[nome] = { nome, nomeacoes: 0, aceites: 0, recusadas: 0, recebido: 0 }
        stats[nome].recebido += Number(l.valor) || 0
      }
    })
    return Object.values(stats).sort((a, b) => b.nomeacoes - a.nomeacoes)
  }, [pericias, lancamentos])

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="shadow-sm md:col-span-1">
        <CardHeader>
          <CardTitle>Aceites vs Recusas</CardTitle>
          <CardDescription>Volume global de aceites e recusas.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {globaisAceitasRecusadas.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Nenhum dado encontrado
            </div>
          ) : (
            <ChartContainer
              config={{
                aceitas: { label: 'Aceitas', color: '#10b981' },
                recusadas: { label: 'Recusadas', color: '#a855f7' },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={globaisAceitasRecusadas}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {globaisAceitasRecusadas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm md:col-span-2">
        <CardHeader>
          <CardTitle>Produtividade por Perito</CardTitle>
          <CardDescription>
            Nomeações, Aceites e Recusas agrupadas por profissional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {peritosStats.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Nenhum dado encontrado
            </div>
          ) : (
            <ChartContainer
              config={{
                nomeacoes: { label: 'Nomeações', color: '#3b82f6' },
                aceites: { label: 'Aceitas', color: '#10b981' },
                recusadas: { label: 'Recusadas', color: '#a855f7' },
              }}
              className="h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peritosStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nome" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="nomeacoes" fill="var(--color-nomeacoes)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aceites" fill="var(--color-aceites)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recusadas" fill="var(--color-recusadas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
