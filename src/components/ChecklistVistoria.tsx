import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, CheckSquare } from 'lucide-react'

const DEFAULT_ITEMS = [
  { id: '1', text: 'Equipamentos', checked: false },
  { id: '2', text: 'Impressão de documentos', checked: false },
  { id: '3', text: 'Escada', checked: false },
  { id: '4', text: 'Lanterna', checked: false },
  { id: '5', text: 'EPIs', checked: false },
  { id: '6', text: 'Drone', checked: false },
  { id: '7', text: 'Câmera térmica', checked: false },
  { id: '8', text: 'Trena', checked: false },
  { id: '9', text: 'Câmera', checked: false },
]

export function ChecklistVistoria() {
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [newItemText, setNewItemText] = useState('')

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    )
  }

  const handleAdd = () => {
    if (!newItemText.trim()) return
    const newItem = { id: crypto.randomUUID(), text: newItemText.trim(), checked: false }
    setItems((prev) => [...prev, newItem])
    setNewItemText('')
  }

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6 pt-2 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Preparação para Vistoria</h3>
      </div>

      <div className="bg-muted/30 p-4 rounded-md border">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`chk-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => handleToggle(item.id)}
                />
                <label
                  htmlFor={`chk-${item.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none transition-colors ${
                    item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {item.text}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleRemove(item.id)}
                title="Remover item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum item na lista de verificação.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Input
          placeholder="Adicionar novo item personalizado..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </div>
    </div>
  )
}
