import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { usePericias } from '@/contexts/PericiasContext'
import { useLancamentos } from '@/hooks/use-lancamentos'
import { supabase } from '@/lib/supabase/client'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
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
  Activity,
  CheckSquare,
  ListTodo,
  Percent,
  Banknote,
  History,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pericia } from '@/lib/types'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

export default function Dashboard() {
  const { pericias } = usePericias()
  const { lancamentos } = useLancamentos()
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterVara, setFilterVara] = useState('all')

  useEffect(() => {
    async function fetchDocs() {
      const { data } = await supabase
        .from('historico_documentos')
        .select('*, pericia:pericias(numero_processo, vara)')
        .order('created_at', { ascending: false })
        .limit(300)
      if (data) setAllDocs(data)
    }
    fetchDocs()
  }, [])

  const recentDocs = useMemo(() => allDocs.slice(0, 10), [allDocs])

  const varas = useMemo(() => {
    const v = new Set<string>()
    allDocs.forEach((d) => {
      if (d.pericia?.vara) v.add(d.pericia.vara)
    })
    return Array.from(v).sort()
  }, [allDocs])

  const filteredDocs = useMemo(() => {
    return allDocs.filter((d) => {
      if (filterDate && !d.created_at.startsWith(filterDate)) return false
      if (filterType !== 'all' && d.tipo_documento !== filterType) return false
      if (filterVara !== 'all' && d.pericia?.vara !== filterVara) return false
      return true
    })
  }, [allDocs, filterDate, filterType, filterVara])

  const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
    if (!d) return null
    const parsed = new Date(d)
    if (isNaN(parsed.getTime())) return null
    return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
  }

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
      const date = parseDateSafe(l.data)
      if (date && (l.status === 'recebido' || l.status === 'pago')) {
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

  const periciasChartData = useMemo(() => {
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
    const data = months.map((m) => ({ month: m, concluidas: 0, novas: 0 }))

    pericias.forEach((p) => {
      const dNomeacao = parseDateSafe(p.dataNomeacao)
      if (dNomeacao) {
        data[dNomeacao.getMonth()].novas += 1
      }

      if (p.status === 'Concluído') {
        const dConclusao = parseDateSafe(p.dataEntregaLaudo) || parseDateSafe(p.dataPericia)
        if (dConclusao) {
          data[dConclusao.getMonth()].concluidas += 1
        }
      }
    })

    const currentMonth = new Date().getMonth()
    const startIndex = (currentMonth - 5 + 12) % 12
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(data[(startIndex + i) % 12])
    }
    return result
  }, [pericias])

  const produtividadeDocsData = useMemo(() => {
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
    const data = months.map((m) => ({ month: m, peticoes: 0, laudos: 0 }))

    allDocs.forEach((doc) => {
      const d = parseDateSafe(doc.created_at)
      if (d) {
        const idx = d.getMonth()
        if (doc.tipo_documento === 'Laudo/Relatório') {
          data[idx].laudos += 1
        } else {
          data[idx].peticoes += 1
        }
      }
    })

    const currentMonth = new Date().getMonth()
    const startIndex = (currentMonth - 5 + 12) % 12
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(data[(startIndex + i) % 12])
    }
    return result
  }, [allDocs])

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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Performance</h1>
        <p className="text-muted-foreground">Resumo financeiro e indicadores de produtividade.</p>
      </div>

      {/* Finance KPIs */}
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

      {/* Productivity KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Em Andamento / Pendentes</CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Produtividade de Perícias (Últimos 6 meses)</CardTitle>
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
            <CardTitle>Documentos e Laudos Entregues</CardTitle>
            <CardDescription>Volume mensal de produção (Últimos 6 meses).</CardDescription>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm flex flex-col h-[400px]">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Documentos Recentes
              </CardTitle>
              <CardDescription>Últimas petições e laudos gerados.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="shrink-0 h-8"
            >
              <Filter className="w-4 h-4 mr-2" /> Histórico Completo
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
                <FileText className="w-12 h-12 mb-2 text-muted-foreground/50" />
                <p>Nenhum documento gerado.</p>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none truncate">
                        {doc.nome_documento}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Proc: {doc.pericia?.numero_processo || 'S/N'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Prazos e Alertas
            </CardTitle>
            <CardDescription>Perícias com prazos críticos.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
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

        <Card className="shadow-sm flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Em Andamento / Pendentes
            </CardTitle>
            <CardDescription>Últimas perícias não finalizadas.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {pendingPericias.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground py-8 h-full">
                <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-500/50" />
                <p>Nenhuma perícia pendente.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {pendingPericias.map((p) => (
                  <Link
                    key={p.id}
                    to="/pericias"
                    className="flex flex-col p-3 rounded-lg border hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">
                        {p.codigoInterno || 'S/ Código'}
                      </span>
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

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico Avançado de Documentos</DialogTitle>
            <DialogDescription>
              Filtre e busque por documentos gerados em todas as perícias.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Data de Geração</label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Tipo de Documento</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="Petição">Petição</SelectItem>
                  <SelectItem value="Laudo/Relatório">Laudo/Relatório</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Vara / Juízo</label>
              <Select value={filterVara} onValueChange={setFilterVara}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Varas</SelectItem>
                  {varas.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {filteredDocs.length} documentos encontrados
            </span>
            {(filterDate || filterType !== 'all' || filterVara !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDate('')
                  setFilterType('all')
                  setFilterVara('all')
                }}
                className="h-8"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-3">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum documento encontrado com os filtros atuais.
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium leading-none">{doc.nome_documento}</p>
                        <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5">
                          <p>
                            Processo:{' '}
                            <span className="font-medium text-foreground">
                              {doc.pericia?.numero_processo || 'S/N'}
                            </span>
                          </p>
                          <p>Vara: {doc.pericia?.vara || 'Não informada'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {doc.tipo_documento}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
