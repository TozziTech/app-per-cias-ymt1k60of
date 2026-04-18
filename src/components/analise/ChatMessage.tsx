import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ChatMessageProps {
  message: any
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.tipo_mensagem === 'usuario' || (message.user_id && !message.tipo_mensagem)

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border',
        )}
      >
        <span className="whitespace-pre-wrap">{message.mensagem}</span>
        <span className={cn('text-[10px] opacity-70', isUser ? 'text-right' : 'text-left')}>
          {message.created_at
            ? format(new Date(message.created_at), 'HH:mm', { locale: ptBR })
            : ''}
        </span>
      </div>
    </div>
  )
}
