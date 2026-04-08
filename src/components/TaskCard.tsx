import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tarefa } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  t: Tarefa
  onEdit: (t: Tarefa) => void
  onDelete: (id: string) => void
  onToggle: (t: Tarefa, v: boolean) => void
}

export function TaskCard({ t, onEdit, onDelete, onToggle }: TaskCardProps) {
  return (
    <Card
      className={cn(
        'hover:border-blue-500/50 transition-colors shadow-sm',
        t.finalizado && 'opacity-60 bg-zinc-50 dark:bg-zinc-900/50',
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Badge
            variant="outline"
            className="text-xs shrink-0 max-w-[200px] truncate"
            title={t.pericia?.numero_processo || 'Sem processo vinculado'}
          >
            {t.pericia?.numero_processo || 'Avulsa'}
          </Badge>
          <Switch
            checked={t.finalizado}
            onCheckedChange={(v) => onToggle(t, v)}
            className="scale-90"
          />
        </div>
        <CardTitle className={cn('text-base leading-tight mt-1', t.finalizado && 'line-through')}>
          {t.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 text-sm space-y-3">
        {t.descricao && <p className="text-muted-foreground line-clamp-2 text-xs">{t.descricao}</p>}
        <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Gestor:</span>
            <span
              className="font-medium text-xs truncate max-w-[120px]"
              title={t.responsavel?.name}
            >
              {t.responsavel?.name || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Perito:</span>
            <span className="font-medium text-xs truncate max-w-[120px]" title={t.perito?.name}>
              {t.perito?.name || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700 mt-1">
            <span className="text-muted-foreground text-xs">Prazo:</span>
            <span className="font-medium text-xs text-orange-600 dark:text-orange-500">
              {t.data_entrega ? format(new Date(t.data_entrega), 'dd/MM/yyyy') : '-'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-8 w-8">
          <Pencil className="h-3.5 w-3.5 text-zinc-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(t.id)}
          className="h-8 w-8 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
