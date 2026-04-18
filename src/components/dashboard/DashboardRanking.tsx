import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Pericia } from '@/lib/types'
import { parseDateSafe } from './utils'
import { differenceInDays } from 'date-fns'

const IDEAL_DAYS = {
  nomeacaoAceite: 5,
  aceitePericia: 30,
  periciaLaudo: 20,
  laudoImpugnacao: 15,
  impugnacaoEsclarecimentos: 15,
  esclarecimentosPagamento: 60,
}

export function DashboardRanking({ pericias }: { pericias: Pericia[] }) {
  const [rankingFilter, setRankingFilter] = useState(
    () => sessionStorage.getItem('dashboard_rankingFilter') || '',
  )
  const [showOnlyBottlenecks, setShowOnlyBottlenecks] = useState(
    () => sessionStorage.getItem('dashboard_showOnlyBottlenecks') === 'true',
  )

  const processRanking = useMemo(() => {
    sessionStorage.setItem('dashboard_rankingFilter', rankingFilter)
    sessionStorage.setItem('dashboard_showOnlyBottlenecks', String(showOnlyBottlenecks))

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

        return { ...p, totalDays, bottlenecks }
      })
      .filter((p) => {
        if (p.totalDays <= 0) return false
        if (showOnlyBottlenecks && p.bottlenecks.length === 0) return false
        if (rankingFilter) {
          const search = rankingFilter.toLowerCase()
          if (
            !p.numeroProcesso?.toLowerCase().includes(search) &&
            !p.vara?.toLowerCase().includes(search)
          )
            return false
        }
        return true
      })
      .sort((a, b) => b.totalDays - a.totalDays)
      .slice(0, 50)
  }, [pericias, showOnlyBottlenecks, rankingFilter])

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" /> Ranking de Processos e Gargalos
          </CardTitle>
          <CardDescription>
            Processos com maior tempo acumulado e alertas de prazos estourados.
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
                    Nenhum processo encontrado.
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
  )
}
