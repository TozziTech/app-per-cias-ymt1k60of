import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  CheckSquare,
  Activity,
  ListTodo,
  Percent,
} from 'lucide-react'
import { Pericia, Lancamento } from '@/lib/types'
import { parseDateSafe, formatCurrency } from './utils'

export function DashboardKpis({
  pericias,
  lancamentos,
}: {
  pericias: Pericia[]
  lancamentos: Lancamento[]
}) {
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

    return { receitas, despesas, saldo: receitas - despesas, movimentado: receitas + despesas }
  }, [lancamentos])

  const periciasKpis = useMemo(() => {
    const total = pericias.length
    const concluidas = pericias.filter((p) => p.status === 'Concluído').length
    const emAndamento = pericias.filter(
      (p) => p.status === 'Em Andamento' || p.status === 'Pendente',
    ).length
    const taxaConclusao = total > 0 ? (concluidas / total) * 100 : 0
    return { total, concluidas, emAndamento, taxaConclusao }
  }, [pericias])

  const vistoriasMes = useMemo(() => {
    const today = new Date()
    let concluidasMes = 0
    let totalMes = 0

    pericias.forEach((p) => {
      const dPericia = parseDateSafe(p.dataPericia)
      if (
        dPericia &&
        dPericia.getMonth() === today.getMonth() &&
        dPericia.getFullYear() === today.getFullYear()
      ) {
        totalMes++
        const isComplete = p.checklist?.length > 0 && p.checklist.every((item) => item.concluido)
        if (isComplete || p.status === 'Concluído') concluidasMes++
      }
    })
    return { concluidasMes, totalMes }
  }, [pericias])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movimentado</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(kpis.movimentado)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
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

        <Card className="shadow-sm">
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

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistorias do Mês</CardTitle>
            <CheckSquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {vistoriasMes.concluidasMes}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / {vistoriasMes.totalMes}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Concluídas (Checklist)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Perícias</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{periciasKpis.total}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perícias Concluídas</CardTitle>
            <CheckSquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{periciasKpis.concluidas}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <ListTodo className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{periciasKpis.emAndamento}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Percent className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">
              {periciasKpis.taxaConclusao.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
