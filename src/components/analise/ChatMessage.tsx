import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: any
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = !message.profiles || !message.user_id

  return (
    <div
      className={cn(
        'animate-fade-in-up flex w-full gap-3',
        isAssistant ? 'justify-start' : 'justify-end',
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">A</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1 md:max-w-[75%]',
          isAssistant ? 'items-start' : 'items-end',
        )}
      >
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isAssistant ? 'Assistente' : message.profiles?.name || 'Você'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.created_at || message.created
              ? format(new Date(message.created_at || message.created), 'HH:mm')
              : ''}
          </span>
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isAssistant
              ? 'rounded-tl-none bg-secondary text-secondary-foreground'
              : 'rounded-tr-none bg-primary text-primary-foreground',
          )}
        >
          {message.mensagem}
        </div>
      </div>

      {!isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
