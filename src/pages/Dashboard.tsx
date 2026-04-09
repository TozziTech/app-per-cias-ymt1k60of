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
  ComposedChart,
  Legend,
  PieChart,
  Pie,
  Cell,
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
  Timer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Pericia } from '@/lib/types'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { Filter, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCsv } from '@/lib/export'

export default function Dashboard() {
  const { pericias } = usePericias()
  const { lancamentos } = useLancamentos()
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [filterDate, setFilterDate] = useState(
    () => sessionStorage.getItem('dashboard_filterDate') || '',
  )
  const [filterType, setFilterType] = useState(
    () => sessionStorage.getItem('dashboard_filterType') || 'all',
  )
  const [filterVara, setFilterVara] = useState(
    () => sessionStorage.getItem('dashboard_filterVara') || 'all',
  )
  const [dashboardPeriod, setDashboardPeriod] = useState<'6m' | '12m' | 'ytd'>(
    () => (sessionStorage.getItem('dashboard_period') as any) || '12m',
  )
  const [rankingFilter, setRankingFilter] = useState(
    () => sessionStorage.getItem('dashboard_rankingFilter') || '',
  )
  const [showOnlyBottlenecks, setShowOnlyBottlenecks] = useState(
    () => sessionStorage.getItem('dashboard_showOnlyBottlenecks') === 'true',
  )

  useEffect(() => {
    sessionStorage.setItem('dashboard_filterDate', filterDate)
    sessionStorage.setItem('dashboard_filterType', filterType)
    sessionStorage.setItem('dashboard_filterVara', filterVara)
    sessionStorage.setItem('dashboard_period', dashboardPeriod)
    sessionStorage.setItem('dashboard_rankingFilter', rankingFilter)
    sessionStorage.setItem('dashboard_showOnlyBottlenecks', String(showOnlyBottlenecks))
  }, [filterDate, filterType, filterVara, dashboardPeriod, rankingFilter, showOnlyBottlenecks])

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

  const periodsConfig = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
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

    let periodMonths = 12
    let startYear = currentYear
    let startMonth = currentMonth

    if (dashboardPeriod === '6m') {
      periodMonths = 6
      startMonth = currentMonth - 5
    } else if (dashboardPeriod === '12m') {
      periodMonths = 12
      startMonth = currentMonth - 11
    } else if (dashboardPeriod === 'ytd') {
      periodMonths = currentMonth + 1
      startMonth = 0
    }

    return Array.from({ length: periodMonths }).map((_, i) => {
      const d = new Date(currentYear, startMonth + i, 1)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      }
    })
  }, [dashboardPeriod])

  const getKey = (date: Date | null) => {
    if (!date) return null
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

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

  const leadTimeData = useMemo(() => {
    let nomeacaoAceite = { total: 0, count: 0 }
    let aceitePericia = { total: 0, count: 0 }
    let periciaLaudo = { total: 0, count: 0 }
    let laudoImpugnacao = { total: 0, count: 0 }
    let impugnacaoEsclarecimentos = { total: 0, count: 0 }
    let esclarecimentosPagamento = { total: 0, count: 0 }

    pericias.forEach((p) => {
      const dNomeacao = parseDateSafe(p.dataNomeacao)
      const dAceite = parseDateSafe(p.dataAceite)
      const dPericia = parseDateSafe(p.dataPericia)
      const dLaudo = parseDateSafe(p.dataEntregaLaudo)
      const dImpugnacao = parseDateSafe(p.dataImpugnacao)
      const dEsclarecimentos = parseDateSafe(p.entregaEsclarecimentos)
      const dPagamento = parseDateSafe(p.dataPagamento)

      if (dNomeacao && dAceite) {
        nomeacaoAceite.total += Math.max(0, differenceInDays(dAceite, dNomeacao))
        nomeacaoAceite.count += 1
      }
      if (dAceite && dPericia) {
        aceitePericia.total += Math.max(0, differenceInDays(dPericia, dAceite))
        aceitePericia.count += 1
      }
      if (dPericia && dLaudo) {
        periciaLaudo.total += Math.max(0, differenceInDays(dLaudo, dPericia))
        periciaLaudo.count += 1
      }
      if (dLaudo && dImpugnacao) {
        laudoImpugnacao.total += Math.max(0, differenceInDays(dImpugnacao, dLaudo))
        laudoImpugnacao.count += 1
      }
      if (dImpugnacao && dEsclarecimentos) {
        impugnacaoEsclarecimentos.total += Math.max(
          0,
          differenceInDays(dEsclarecimentos, dImpugnacao),
        )
        impugnacaoEsclarecimentos.count += 1
      }
      if (dEsclarecimentos && dPagamento) {
        esclarecimentosPagamento.total += Math.max(
          0,
          differenceInDays(dPagamento, dEsclarecimentos),
        )
        esclarecimentosPagamento.count += 1
      }
    })

    return [
      {
        etapa: 'Nomeação → Aceite',
        dias: nomeacaoAceite.count ? Math.round(nomeacaoAceite.total / nomeacaoAceite.count) : 0,
      },
      {
        etapa: 'Aceite → Perícia',
        dias: aceitePericia.count ? Math.round(aceitePericia.total / aceitePericia.count) : 0,
      },
      {
        etapa: 'Perícia → Laudo',
        dias: periciaLaudo.count ? Math.round(periciaLaudo.total / periciaLaudo.count) : 0,
      },
      {
        etapa: 'Laudo → Contestação',
        dias: laudoImpugnacao.count ? Math.round(laudoImpugnacao.total / laudoImpugnacao.count) : 0,
      },
      {
        etapa: 'Contest. → Esclar.',
        dias: impugnacaoEsclarecimentos.count
          ? Math.round(impugnacaoEsclarecimentos.total / impugnacaoEsclarecimentos.count)
          : 0,
      },
      {
        etapa: 'Esclar. → Pagamento',
        dias: esclarecimentosPagamento.count
          ? Math.round(esclarecimentosPagamento.total / esclarecimentosPagamento.count)
          : 0,
      },
    ]
  }, [pericias])

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
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    let concluidasMes = 0
    let totalMes = 0

    pericias.forEach((p) => {
      const dPericia = parseDateSafe(p.dataPericia)
      if (
        dPericia &&
        dPericia.getMonth() === currentMonth &&
        dPericia.getFullYear() === currentYear
      ) {
        totalMes++
        const hasChecklist = p.checklist && p.checklist.length > 0
        const isChecklistComplete = hasChecklist && p.checklist.every((item) => item.concluido)
        if (isChecklistComplete || p.status === 'Concluído') {
          concluidasMes++
        }
      }
    })

    return { concluidasMes, totalMes }
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

  const IDEAL_DAYS = {
    nomeacaoAceite: 5,
    aceitePericia: 30,
    periciaLaudo: 20,
    laudoImpugnacao: 15,
    impugnacaoEsclarecimentos: 15,
    esclarecimentosPagamento: 60,
  }

  const processRanking = useMemo(() => {
    return pericias
      .map((p) => {
        const dNomeacao = parseDateSafe(p.dataNomeacao)
        const dAceite = parseDateSafe(p.dataAceite)
        const dPericia = parseDateSafe(p.dataPericia)
        const dLaudo = parseDateSafe(p.dataEntregaLaudo)
        const dImpugnacao = parseDateSafe(p.dataImpugnacao)
        const dEsclarecimentos = parseDateSafe(p.entregaEsclarecimentos)
        const dPagamento = parseDateSafe(p.dataPagamento)

        const nomeacaoAceite =
          dNomeacao && dAceite ? Math.max(0, differenceInDays(dAceite, dNomeacao)) : null
        const aceitePericia =
          dAceite && dPericia ? Math.max(0, differenceInDays(dPericia, dAceite)) : null
        const periciaLaudo =
          dPericia && dLaudo ? Math.max(0, differenceInDays(dLaudo, dPericia)) : null
        const laudoImpugnacao =
          dLaudo && dImpugnacao ? Math.max(0, differenceInDays(dImpugnacao, dLaudo)) : null
        const impugnacaoEsclarecimentos =
          dImpugnacao && dEsclarecimentos
            ? Math.max(0, differenceInDays(dEsclarecimentos, dImpugnacao))
            : null
        const esclarecimentosPagamento =
          dEsclarecimentos && dPagamento
            ? Math.max(0, differenceInDays(dPagamento, dEsclarecimentos))
            : null

        const totalDays = [
          nomeacaoAceite,
          aceitePericia,
          periciaLaudo,
          laudoImpugnacao,
          impugnacaoEsclarecimentos,
          esclarecimentosPagamento,
        ].reduce((acc, val) => acc + (val || 0), 0)

        const bottlenecks = []
        if (nomeacaoAceite !== null && nomeacaoAceite > IDEAL_DAYS.nomeacaoAceite)
          bottlenecks.push('Nomeação')
        if (aceitePericia !== null && aceitePericia > IDEAL_DAYS.aceitePericia)
          bottlenecks.push('Perícia')
        if (periciaLaudo !== null && periciaLaudo > IDEAL_DAYS.periciaLaudo)
          bottlenecks.push('Laudo')
        if (laudoImpugnacao !== null && laudoImpugnacao > IDEAL_DAYS.laudoImpugnacao)
          bottlenecks.push('Contest.')
        if (
          impugnacaoEsclarecimentos !== null &&
          impugnacaoEsclarecimentos > IDEAL_DAYS.impugnacaoEsclarecimentos
        )
          bottlenecks.push('Esclar.')
        if (
          esclarecimentosPagamento !== null &&
          esclarecimentosPagamento > IDEAL_DAYS.esclarecimentosPagamento
        )
          bottlenecks.push('Pagamento')

        return {
          ...p,
          nomeacaoAceite,
          aceitePericia,
          periciaLaudo,
          laudoImpugnacao,
          impugnacaoEsclarecimentos,
          esclarecimentosPagamento,
          totalDays,
          bottlenecks,
        }
      })
      .filter((p) => {
        if (p.totalDays <= 0) return false
        if (showOnlyBottlenecks && p.bottlenecks.length === 0) return false
        if (rankingFilter) {
          const search = rankingFilter.toLowerCase()
          const matchProc = p.numeroProcesso?.toLowerCase().includes(search)
          const matchVara = p.vara?.toLowerCase().includes(search)
          if (!matchProc && !matchVara) return false
        }
        return true
      })
      .sort((a, b) => b.totalDays - a.totalDays)
      .slice(0, 50)
  }, [pericias, showOnlyBottlenecks, rankingFilter])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Performance</h1>
          <p className="text-muted-foreground">Resumo financeiro e indicadores de produtividade.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Select value={dashboardPeriod} onValueChange={(v: any) => setDashboardPeriod(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="ytd">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto shadow-sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                Exportar PDF (Visualização)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportToCsv(
                    'dashboard_peritos.csv',
                    peritosStats.map((p) => ({
                      Perito: p.nome,
                      Nomeações: p.nomeacoes,
                      Aceitas: p.aceites,
                      Recusadas: p.recusadas,
                      'Total Recebido': p.recebido,
                    })),
                  )
                }
              >
                Excel - Produtividade Peritos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportToCsv(
                    'dashboard_historico.csv',
                    produtividadeHistoricaData.map((p) => ({
                      Mês: p.label,
                      Nomeações: p.nomeacoes,
                      Aceitas: p.aceites,
                      'Laudos Entregues': p.laudosEntregues,
                      Honorários: p.honorarios,
                    })),
                  )
                }
              >
                Excel - Produtividade Histórica
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Produtividade Histórica e Honorários</CardTitle>
          <CardDescription>
            Visão consolidada de nomeações, aceites, entregas e honorários recebidos (
            {dashboardPeriod === '6m'
              ? 'últimos 6 meses'
              : dashboardPeriod === '12m'
                ? 'últimos 12 meses'
                : 'ano atual'}
            ).
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Lead Time Médio por Etapa (Ciclo de Vida da Perícia)
          </CardTitle>
          <CardDescription>
            Tempo médio em dias transcorridos entre os principais marcos do processo pericial.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              dias: { label: 'Dias (Média)', color: '#0ea5e9' },
            }}
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

        <Card className="shadow-sm md:col-span-3">
          <CardHeader>
            <CardTitle>Recebimentos por Perito</CardTitle>
            <CardDescription>Total de honorários recebidos por profissional.</CardDescription>
          </CardHeader>
          <CardContent>
            {peritosStats.filter((p) => p.recebido > 0).length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                Nenhum honorário recebido
              </div>
            ) : (
              <ChartContainer
                config={{
                  recebido: { label: 'Total Recebido', color: '#f59e0b' },
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={peritosStats.filter((p) => p.recebido > 0)}
                    margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nome" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$ ${v}`}
                      width={80}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="recebido" fill="var(--color-recebido)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Ranking de Processos e Gargalos
            </CardTitle>
            <CardDescription>
              Processos com maior tempo acumulado e alertas de etapas que excederam o prazo ideal.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="bottlenecks"
                checked={showOnlyBottlenecks}
                onCheckedChange={setShowOnlyBottlenecks}
              />
              <Label htmlFor="bottlenecks" className="text-xs">
                Apenas c/ Gargalos
              </Label>
            </div>
            <Input
              placeholder="Buscar processo ou vara..."
              value={rankingFilter}
              onChange={(e) => setRankingFilter(e.target.value)}
              className="h-8 w-[200px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processo</TableHead>
                  <TableHead>Vara</TableHead>
                  <TableHead className="text-right">Total (Dias)</TableHead>
                  <TableHead>Gargalos</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processRanking.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum processo encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  processRanking.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.numeroProcesso || p.codigoInterno}
                      </TableCell>
                      <TableCell>{p.vara}</TableCell>
                      <TableCell className="text-right font-bold">{p.totalDays}</TableCell>
                      <TableCell>
                        {p.bottlenecks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.bottlenecks.map((b, i) => (
                              <Badge key={i} variant="destructive" className="text-[10px]">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-500 border-emerald-500/50"
                          >
                            No Prazo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/pericias`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

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
