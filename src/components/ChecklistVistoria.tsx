import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, CheckSquare, Printer, MapPin, Users, Loader2, FileText } from 'lucide-react'
import { Pericia } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

const DEFAULT_ITEMS = [
  'Equipamentos',
  'Impressão de documentos',
  'Escada',
  'Lanterna',
  'EPIs',
  'Drone',
  'Câmera térmica',
  'Trena',
  'Câmera',
]

interface ChecklistVistoriaProps {
  pericia: Pericia | null
  onUpdate: (id: string, updates: Partial<Pericia>) => Promise<void>
}

export function ChecklistVistoria({ pericia, onUpdate }: ChecklistVistoriaProps) {
  const { toast } = useToast()
  const [newItemText, setNewItemText] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [expandedObs, setExpandedObs] = useState<string | null>(null)

  const items = pericia?.checklist || []

  useEffect(() => {
    if (pericia && (!pericia.checklist || pericia.checklist.length === 0)) {
      const initialItems = DEFAULT_ITEMS.map((text) => ({
        id: crypto.randomUUID(),
        texto: text,
        concluido: false,
      }))
      onUpdate(pericia.id, { checklist: initialItems })
    }
  }, [pericia])

  const handleToggle = async (id: string) => {
    if (!pericia) return
    setIsUpdating(true)
    const newItems = items.map((item) =>
      item.id === id ? { ...item, concluido: !item.concluido } : item,
    )
    try {
      await onUpdate(pericia.id, { checklist: newItems })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao atualizar item.', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateObs = async (id: string, observacao: string) => {
    if (!pericia) return
    const newItems = items.map((item) => (item.id === id ? { ...item, observacao } : item))
    try {
      await onUpdate(pericia.id, { checklist: newItems })
      toast({ title: 'Sucesso', description: 'Observação salva com sucesso.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar observação.',
        variant: 'destructive',
      })
    }
  }

  const handleAdd = async () => {
    if (!pericia || !newItemText.trim()) return
    setIsUpdating(true)
    const newItem = { id: crypto.randomUUID(), texto: newItemText.trim(), concluido: false }
    const newItems = [...items, newItem]
    try {
      await onUpdate(pericia.id, { checklist: newItems })
      setNewItemText('')
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao adicionar item.', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!pericia) return
    setIsUpdating(true)
    const newItems = items.filter((item) => item.id !== id)
    try {
      await onUpdate(pericia.id, { checklist: newItems })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao remover item.', variant: 'destructive' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    if (!pericia) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>CHECK-LIST VISTORIA - ${pericia.codigoInterno || pericia.numeroProcesso}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { font-size: 24px; margin: 0; color: #111827; text-transform: uppercase; }
            h2 { font-size: 16px; margin: 5px 0 0 0; color: #4b5563; font-weight: normal; }
            .info-section { margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 14px; color: #111827; }
            .checklist { margin-top: 30px; }
            .checklist-title { font-size: 18px; font-weight: bold; background-color: #f3f4f6; padding: 8px 12px; border-left: 4px solid #D4AF37; margin-bottom: 15px; color: #374151; }
            .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .check-item-container { margin-bottom: 12px; }
            .check-item { display: flex; align-items: center; }
            .box { width: 16px; height: 16px; border: 1px solid #000; margin-right: 10px; display: inline-block; text-align: center; line-height: 16px; font-size: 14px; }
            .obs-item { margin-left: 28px; font-size: 12px; color: #4b5563; font-style: italic; margin-top: 4px; }
            .obs-section { margin-top: 40px; }
            .obs-box { border: 1px solid #ccc; height: 150px; margin-top: 10px; }
            @media print {
              body { padding: 0; }
              .checklist-title { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; border-left: 4px solid #D4AF37 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CHECK-LIST VISTORIA</h1>
            <h2>Processo: ${pericia.numeroProcesso || '-'} ${pericia.codigoInterno ? `| Ref: ${pericia.codigoInterno}` : ''}</h2>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div>
                <div class="label">Endereço da Perícia</div>
                <div class="value">${pericia.endereco || '-'} ${pericia.cidade ? `- ${pericia.cidade}` : ''}</div>
              </div>
              <div>
                <div class="label">Data Agendada</div>
                <div class="value">${pericia.dataPericia ? new Date(pericia.dataPericia).toLocaleDateString('pt-BR') : 'Não agendada'}</div>
              </div>
              <div>
                <div class="label">Advogado(a) Autora</div>
                <div class="value">${pericia.advogadoAutora || '-'}</div>
              </div>
              <div>
                <div class="label">Advogado(a) Ré</div>
                <div class="value">${pericia.advogadoRe || '-'}</div>
              </div>
              <div>
                <div class="label">Assistente Autora</div>
                <div class="value">${pericia.assistenteTecnicoAutora || '-'}</div>
              </div>
              <div>
                <div class="label">Assistente Ré</div>
                <div class="value">${pericia.assistenteTecnicoRe || '-'}</div>
              </div>
              <div style="grid-column: span 2;">
                <div class="label">Perito / Profissional</div>
                <div class="value">${pericia.peritoAssociado || '-'}</div>
              </div>
            </div>
          </div>

          <div class="checklist">
            <div class="checklist-title">Itens de Verificação</div>
            <div class="checklist-grid">
              ${items
                .map(
                  (item) => `
                <div class="check-item-container">
                  <div class="check-item">
                    <div class="box">${item.concluido ? 'X' : '&nbsp;'}</div>
                    <span>${item.texto}</span>
                  </div>
                  ${item.observacao ? `<div class="obs-item">Obs: ${item.observacao.replace(/\n/g, '<br/>')}</div>` : ''}
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <div class="obs-section">
            <div class="label">Observações e Anotações de Campo</div>
            <div class="obs-box"></div>
          </div>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  if (!pericia) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">Selecione uma perícia.</div>
    )
  }

  return (
    <div className="space-y-6 pt-2 pb-6">
      <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold tracking-tight uppercase">Check-List Vistoria</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="shadow-sm w-full sm:w-auto"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Endereço do Local
            </span>
            <p className="font-medium text-foreground">
              {pericia.endereco || '-'} {pericia.cidade ? `- ${pericia.cidade}` : ''}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Profissional
            </span>
            <p className="font-medium text-foreground">{pericia.peritoAssociado || '-'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Advogados</span>
            <p className="text-foreground">
              <span className="text-muted-foreground">Autora:</span> {pericia.advogadoAutora || '-'}
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Ré:</span> {pericia.advogadoRe || '-'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Assistentes Técnicos
            </span>
            <p className="text-foreground">
              <span className="text-muted-foreground">Autora:</span>{' '}
              {pericia.assistenteTecnicoAutora || '-'}
            </p>
            <p className="text-foreground">
              <span className="text-muted-foreground">Ré:</span>{' '}
              {pericia.assistenteTecnicoRe || '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden flex-1 pr-2">
                  <Checkbox
                    id={`chk-${item.id}`}
                    checked={item.concluido}
                    onCheckedChange={() => handleToggle(item.id)}
                    disabled={isUpdating}
                  />
                  <label
                    htmlFor={`chk-${item.id}`}
                    className={`text-sm font-medium leading-none cursor-pointer select-none transition-colors truncate ${
                      item.concluido ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                    title={item.texto}
                  >
                    {item.texto}
                  </label>
                </div>
                <div
                  className={`flex items-center gap-1 transition-opacity ${expandedObs === item.id || item.observacao ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${item.observacao ? 'text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setExpandedObs(expandedObs === item.id ? null : item.id)}
                    title={item.observacao ? 'Editar Observação' : 'Adicionar Observação'}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleRemove(item.id)}
                    disabled={isUpdating}
                    title="Remover item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {(expandedObs === item.id || item.observacao) && (
                <div className="pl-7 pr-8 pt-2 animate-in slide-in-from-top-1">
                  <Textarea
                    placeholder="Adicionar anotações ou observações para este item..."
                    defaultValue={item.observacao}
                    className="text-xs min-h-[60px] resize-none"
                    onBlur={(e) => handleUpdateObs(item.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground py-6 text-center border rounded-md border-dashed">
              Nenhum item na lista de verificação.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
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
          className="flex-1 h-9"
          disabled={isUpdating}
        />
        <Button
          onClick={handleAdd}
          className="shrink-0 h-9"
          disabled={isUpdating || !newItemText.trim()}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Adicionar
        </Button>
      </div>
    </div>
  )
}
