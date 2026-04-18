import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  pericias: any[]
  selectedId?: string
  onSelect: (pericia: any) => void
  loading: boolean
  onNewClick: () => void
}

export function ChatSidebar({
  pericias,
  selectedId,
  onSelect,
  loading,
  onNewClick,
}: ChatSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col border-r bg-card/50">
      <div className="border-b p-4">
        <Button className="h-11 w-full" variant="default" onClick={onNewClick}>
          <Plus className="mr-2 h-4 w-4" /> Nova Perícia
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : pericias.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nenhuma perícia encontrada.
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {pericias.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className={cn(
                  'flex w-full flex-col items-start gap-1 rounded-md p-3 text-left text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                  selectedId === p.id && 'bg-accent font-medium text-accent-foreground',
                )}
              >
                <span className="w-full truncate text-sm">
                  {p.numero_processo || p.numeroProcesso || 'Processo sem número'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.created_at || p.created
                    ? format(new Date(p.created_at || p.created), 'dd/MM/yyyy', { locale: ptBR })
                    : 'Sem data'}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
