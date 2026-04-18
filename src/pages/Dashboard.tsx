import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { usePericias } from '@/contexts/PericiasContext'
import { useLancamentos } from '@/hooks/use-lancamentos'
import { DashboardKpis } from '@/components/dashboard/DashboardKpis'
import { DashboardFinancialCharts } from '@/components/dashboard/DashboardFinancialCharts'
import { DashboardProductivityCharts } from '@/components/dashboard/DashboardProductivityCharts'
import { DashboardPeritoCharts } from '@/components/dashboard/DashboardPeritoCharts'
import { DashboardRanking } from '@/components/dashboard/DashboardRanking'
import { DashboardActivities } from '@/components/dashboard/DashboardActivities'

export default function Dashboard() {
  const { pericias } = usePericias()
  const { lancamentos } = useLancamentos()
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [dashboardPeriod, setDashboardPeriod] = useState<'6m' | '12m' | 'ytd'>(
    () => (sessionStorage.getItem('dashboard_period') as any) || '12m',
  )

  useEffect(() => {
    sessionStorage.setItem('dashboard_period', dashboardPeriod)
  }, [dashboardPeriod])

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await pb.collection('historico_documentos').getList(1, 300, {
          sort: '-created',
          expand: 'pericia_id',
        })
        const mapped = data.items.map((d) => ({
          ...d,
          created_at: d.created,
          pericia: d.expand?.pericia_id
            ? {
                numero_processo: d.expand.pericia_id.numero_processo,
                vara: d.expand.pericia_id.vara,
              }
            : null,
        }))
        setAllDocs(mapped)
      } catch (e) {
        console.error('Failed to load docs', e)
      }
    }
    fetchDocs()
  }, [])

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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DashboardKpis pericias={pericias} lancamentos={lancamentos} />

      <DashboardFinancialCharts
        pericias={pericias}
        lancamentos={lancamentos}
        allDocs={allDocs}
        dashboardPeriod={dashboardPeriod}
      />

      <DashboardProductivityCharts
        pericias={pericias}
        allDocs={allDocs}
        dashboardPeriod={dashboardPeriod}
      />

      <DashboardPeritoCharts pericias={pericias} lancamentos={lancamentos} />

      <DashboardRanking pericias={pericias} />

      <DashboardActivities pericias={pericias} allDocs={allDocs} />
    </div>
  )
}
