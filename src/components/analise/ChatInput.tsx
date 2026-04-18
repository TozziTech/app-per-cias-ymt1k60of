import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string, file?: File | null) => void
  isSending: boolean
  disabled: boolean
}

export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((!text.trim() && !file) || isSending) return
    onSend(text, file)
    setText('')
    setFile(null)
  }

  return (
    <div className="border-t bg-card p-4">
      {file && (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          disabled={disabled || isSending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem ou anexe um documento..."
          className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl bg-muted/50 focus-visible:ring-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={disabled || isSending}
        />
        <Button
          className="h-11 w-11 shrink-0 rounded-xl"
          size="icon"
          disabled={disabled || isSending || (!text.trim() && !file)}
          onClick={handleSend}
        >
          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
