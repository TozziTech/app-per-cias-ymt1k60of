import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, Send, X, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string, file?: File | null) => void
  isSending: boolean
  disabled?: boolean
}

export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!text.trim() && !file) return
    onSend(text, file)
    setText('')
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t bg-card p-4">
      {file && (
        <div className="flex items-center gap-2 self-start rounded-full border bg-secondary/50 px-3 py-1.5 text-xs text-secondary-foreground shadow-sm">
          <span className="max-w-[200px] truncate font-medium">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="ml-1 text-muted-foreground hover:text-foreground"
            aria-label="Remover arquivo anexado"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Mensagem
        </label>
        <Input
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem ou anexe um PDF..."
          className="h-11 flex-1 shadow-sm"
          tabIndex={1}
          disabled={disabled || isSending}
          autoComplete="off"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || isSending || (!text.trim() && !file)}
          className="h-11 w-11 shrink-0 rounded-full px-0 shadow-sm"
          tabIndex={2}
          aria-label="Enviar mensagem"
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-11 w-11 shrink-0 rounded-full px-0 shadow-sm"
          tabIndex={3}
          disabled={disabled || isSending}
          aria-label="Anexar PDF"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
