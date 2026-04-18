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
import { Download, LayoutDashboard, Check } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { usePericias } from '@/contexts/PericiasContext'
import { useLancamentos } from '@/hooks/use-lancamentos'
import { DashboardKpis } from '@/components/dashboard/DashboardKpis'
import { DashboardFinancialCharts } from '@/components/dashboard/DashboardFinancialCharts'
import { DashboardProductivityCharts } from '@/components/dashboard/DashboardProductivityCharts'
import { DashboardPeritoCharts } from '@/components/dashboard/DashboardPeritoCharts'
import { DashboardRanking } from '@/components/dashboard/DashboardRanking'
import { DashboardActivities } from '@/components/dashboard/DashboardActivities'

const WIDGET_MAP: Record<string, React.FC<any>> = {
  kpis: DashboardKpis,
  financial: DashboardFinancialCharts,
  productivity: DashboardProductivityCharts,
  perito: DashboardPeritoCharts,
  ranking: DashboardRanking,
  activities: DashboardActivities,
}

export default function Dashboard() {
  const { pericias } = usePericias()
  const { lancamentos } = useLancamentos()
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [dashboardPeriod, setDashboardPeriod] = useState<'6m' | '12m' | 'ytd'>(
    () => (sessionStorage.getItem('dashboard_period') as any) || '12m',
  )

  const [layout, setLayout] = useState<string[]>([
    'kpis',
    'financial',
    'productivity',
    'perito',
    'ranking',
    'activities',
  ])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

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

    async function fetchLayout() {
      try {
        if (!pb.authStore.record) return
        const config = await pb
          .collection('user_dashboard_configs')
          .getFirstListItem(`user="${pb.authStore.record.id}"`)
        if (config && config.layout_data) {
          const l = config.layout_data as string[]
          if (Array.isArray(l) && l.length > 0) {
            const valid = l.filter((k: string) => WIDGET_MAP[k])
            const missing = Object.keys(WIDGET_MAP).filter((k) => !valid.includes(k))
            setLayout([...valid, ...missing])
          }
        }
      } catch (e) {
        // Not found, use default
      }
    }
    fetchLayout()
  }, [])

  const saveLayout = async (newLayout: string[]) => {
    try {
      if (!pb.authStore.record) return
      const existing = await pb
        .collection('user_dashboard_configs')
        .getFullList({ filter: `user="${pb.authStore.record.id}"` })
      if (existing.length > 0) {
        await pb
          .collection('user_dashboard_configs')
          .update(existing[0].id, { layout_data: newLayout })
      } else {
        await pb
          .collection('user_dashboard_configs')
          .create({ user: pb.authStore.record.id, layout_data: newLayout })
      }
    } catch (e) {
      console.error('Failed to save layout', e)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIdx === null || draggedIdx === index) return

    const newLayout = [...layout]
    const item = newLayout.splice(draggedIdx, 1)[0]
    newLayout.splice(index, 0, item)
    setLayout(newLayout)
    setDraggedIdx(index)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  const toggleCustomize = () => {
    if (isCustomizing) {
      saveLayout(layout)
    }
    setIsCustomizing(!isCustomizing)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Performance</h1>
          <p className="text-muted-foreground">Resumo financeiro e indicadores de produtividade.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button
            variant={isCustomizing ? 'default' : 'outline'}
            onClick={toggleCustomize}
            className="w-full sm:w-auto shadow-sm"
          >
            {isCustomizing ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <LayoutDashboard className="mr-2 h-4 w-4" />
            )}
            {isCustomizing ? 'Salvar Layout' : 'Personalizar'}
          </Button>

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

      <div className="space-y-6">
        {layout.map((id, index) => {
          const Widget = WIDGET_MAP[id]
          if (!Widget) return null

          return (
            <div
              key={id}
              draggable={isCustomizing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 ${
                isCustomizing
                  ? 'cursor-move ring-2 ring-primary/50 border-dashed border-2 border-primary/30 p-2 rounded-lg bg-primary/5 hover:bg-primary/10'
                  : ''
              } ${draggedIdx === index ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}
            >
              {isCustomizing && (
                <div className="absolute -top-3 -right-3 z-10 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
              )}
              <Widget
                pericias={pericias}
                lancamentos={lancamentos}
                allDocs={allDocs}
                dashboardPeriod={dashboardPeriod}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
