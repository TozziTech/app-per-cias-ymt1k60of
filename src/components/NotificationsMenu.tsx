import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getNotificacoes,
  markAsRead,
  markAllAsRead,
  subscribeToNotificacoes,
  Notificacao,
} from '@/services/notificacoes'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationsMenu() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const loadNotificacoes = async () => {
    try {
      const data = await getNotificacoes()
      setNotificacoes(data)
    } catch (error) {
      console.error('Erro ao carregar notificações', error)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadNotificacoes()

    const subscription = subscribeToNotificacoes(user.id, () => {
      loadNotificacoes()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  const unreadCount = notificacoes.filter((n) => !n.lida).length

  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      await markAsRead(id)
      setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
      if (link) {
        setOpen(false)
        navigate(link)
      }
    } catch (error) {
      console.error('Erro ao marcar como lida', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    } catch (error) {
      console.error('Erro ao marcar todas como lidas', error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`flex flex-col gap-1 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notificacao.lida ? 'bg-muted/20' : ''}`}
                  onClick={() => handleMarkAsRead(notificacao.id, notificacao.link)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm ${!notificacao.lida ? 'font-semibold' : 'font-medium'}`}
                    >
                      {notificacao.titulo}
                    </span>
                    {!notificacao.lida && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {notificacao.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notificacao.descricao}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notificacao.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
