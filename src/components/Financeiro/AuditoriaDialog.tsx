import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Loader2, History } from 'lucide-react'

interface Log {
  id: string
  action: string
  created_at: string
  details: any
  profiles?: { name: string }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditoriaDialog({ open, onOpenChange }: Props) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open])

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profiles:user_id(name)')
      .eq('entity_type', 'lançamento')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setLogs(data as Log[])
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Auditoria Financeira
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro de auditoria encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg bg-card shadow-sm text-sm">
                  <div className="flex justify-between items-start mb-2 border-b pb-2">
                    <span className="font-semibold text-primary">
                      {log.profiles?.name || 'Usuário do Sistema'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="text-muted-foreground mb-2">
                    Operação: <BadgeAction action={log.action} />
                  </div>
                  {log.details && (
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono break-all text-foreground overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function BadgeAction({ action }: { action: string }) {
  const getColors = () => {
    switch (action.toLowerCase()) {
      case 'criou':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'atualizou':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'excluiu':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
    }
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${getColors()}`}
    >
      {action}
    </span>
  )
}
