import { useState, useMemo } from 'react'
import { useLancamentos } from '@/hooks/use-lancamentos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { LancamentoForm } from '@/components/Financeiro/LancamentoForm'
import { LancamentosTable } from '@/components/Financeiro/LancamentosTable'
import { Lancamento } from '@/lib/types'
import { exportToCsv } from '@/lib/export'
import { Download, History } from 'lucide-react'
import { AuditoriaDialog } from '@/components/Financeiro/AuditoriaDialog'

export default function Financeiro() {
  const { lancamentos, loading, addLancamentos, updateLancamento, deleteLancamento } =
    useLancamentos()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false)
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | undefined>(undefined)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const kpis = useMemo(() => {
    let receitas = 0
    let despesas = 0
    let aReceber = 0
    let aPagar = 0

    lancamentos.forEach((l) => {
      const valor = Number(l.valor) || 0
      if (l.tipo === 'receita') {
        if (l.status === 'recebido' || l.status === 'pago') receitas += valor
        else aReceber += valor
      } else {
        if (l.status === 'pago' || l.status === 'recebido') despesas += valor
        else aPagar += valor
      }
    })

    return { receitas, despesas, saldo: receitas - despesas, aReceber, aPagar }
  }, [lancamentos])

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
    const data = months.map((m) => ({ month: m, receitas: 0, despesas: 0 }))

    lancamentos.forEach((l) => {
      const date = new Date(l.data)
      if (!isNaN(date.getTime()) && (l.status === 'recebido' || l.status === 'pago')) {
        const idx = date.getMonth()
        if (l.tipo === 'receita') data[idx].receitas += Number(l.valor) || 0
        else data[idx].despesas += Number(l.valor) || 0
      }
    })

    const currentMonth = new Date().getMonth()
    const startIndex = (currentMonth - 5 + 12) % 12
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(data[(startIndex + i) % 12])
    }
    return result
  }, [lancamentos])

  const handleEdit = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento)
    setIsFormOpen(true)
  }

  const handleOpenNew = () => {
    setEditingLancamento(undefined)
    setIsFormOpen(true)
  }

  const handleExportExcel = () => {
    exportToCsv(
      'fluxo_caixa.csv',
      lancamentos.map((l) => ({
        Data: new Date(l.data).toLocaleDateString('pt-BR'),
        Tipo: l.tipo === 'receita' ? 'Receita' : 'Despesa',
        Categoria: l.categoria,
        Descrição: l.descricao,
        Valor: l.valor,
        Status: l.status,
        Processo: l.pericia?.numero_processo || '-',
        Responsável: l.responsavel?.name || '-',
      })),
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas vinculadas aos processos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsAuditoriaOpen(true)}
            className="shadow-sm"
            title="Histórico de Auditoria"
          >
            <History className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={handleOpenNew} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Lançamento</span>
          </Button>
        </div>
      </div>

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
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(kpis.receitas)}
            </div>
            <p className="text-xs text-muted-foreground">
              + {formatCurrency(kpis.aReceber)} a receber
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(kpis.despesas)}
            </div>
            <p className="text-xs text-muted-foreground">+ {formatCurrency(kpis.aPagar)} a pagar</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provisão Futura</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(kpis.aReceber - kpis.aPagar)}
            </div>
            <p className="text-xs text-muted-foreground">A Receber - A Pagar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full shadow-sm">
          <CardHeader>
            <CardTitle>Balanço Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                receitas: {
                  label: 'Receitas',
                  color: 'hsl(var(--primary))',
                },
                despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
              }}
              className="h-[250px] w-full"
            >
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
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <LancamentosTable
          lancamentos={lancamentos}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={deleteLancamento}
        />
      </div>

      <LancamentoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        lancamento={editingLancamento}
        onSave={async (dataArray) => {
          if (editingLancamento) {
            await updateLancamento(editingLancamento.id, dataArray[0])
          } else {
            await addLancamentos(dataArray)
          }
          setIsFormOpen(false)
        }}
      />

      <AuditoriaDialog open={isAuditoriaOpen} onOpenChange={setIsAuditoriaOpen} />
    </div>
  )
}
