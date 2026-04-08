import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Settings, Plus, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface GerenciadorTemplatesProps {
  templates: any[]
  onTemplatesChange: () => void
}

export function GerenciadorTemplates({ templates, onTemplatesChange }: GerenciadorTemplatesProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [conteudo, setConteudo] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  const handleEdit = (t: any) => {
    setEditingId(t.id)
    setNome(t.nome)
    setConteudo(t.conteudo)
  }

  const handleNew = () => {
    setEditingId('new')
    setNome('')
    setConteudo('[CABEÇALHO]\n\nEscreva seu documento aqui...\n\n[RODAPE]')
  }

  const handleSave = async () => {
    if (!nome || !conteudo) return
    const isNew = editingId === 'new'

    if (isNew) {
      const { error } = await supabase.from('peticao_templates').insert({
        nome,
        conteudo,
        user_id: user?.id,
      })
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message })
        return
      }
    } else {
      const { error } = await supabase
        .from('peticao_templates')
        .update({
          nome,
          conteudo,
        })
        .eq('id', editingId)
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message })
        return
      }
    }

    toast({ title: 'Sucesso', description: 'Template salvo com sucesso!' })
    setEditingId(null)
    onTemplatesChange()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('peticao_templates').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } else {
      toast({ title: 'Sucesso', description: 'Template excluído.' })
      if (editingId === id) setEditingId(null)
      onTemplatesChange()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-background">
          <Settings className="h-4 w-4 mr-2" /> Gerenciar Modelos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Modelos de Documentos</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 mt-4">
          <div className="w-full md:w-1/3 flex flex-col gap-2 border-r pr-4 overflow-y-auto">
            <Button variant="secondary" onClick={handleNew} className="w-full mb-2 shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Novo Modelo
            </Button>
            {templates.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col gap-2 p-3 border rounded-md hover:bg-muted/50 ${editingId === t.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium flex-1 leading-tight">{t.nome}</span>
                  <div className="flex items-center shrink-0">
                    {!t.is_system && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEdit(t)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {t.is_system && (
                      <span className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold tracking-wider">
                        Sistema
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pl-2">
            {editingId ? (
              <>
                <div className="space-y-2 shrink-0">
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do Modelo"
                    className="font-semibold text-lg"
                  />
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md border">
                    <span className="font-semibold mb-1 block">
                      Tags disponíveis para uso no texto:
                    </span>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground">
                      [CABEÇALHO]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground mx-1">
                      [RODAPE]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground">
                      [VALOR_HONORARIOS]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground mx-1">
                      [VALOR_EXTENSO]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground">
                      [DATA_PERICIA]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border text-foreground mx-1">
                      [ENDERECO_PERICIA]
                    </code>
                  </div>
                </div>
                <Textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed resize-none p-4"
                  placeholder="Escreva o texto do documento aqui..."
                />
                <div className="flex justify-end gap-2 shrink-0 pt-2">
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>Salvar Modelo</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center space-y-4">
                <Settings className="h-12 w-12 opacity-20" />
                <p className="text-sm max-w-[250px]">
                  Selecione um modelo à esquerda para editar ou clique em "Novo Modelo" para criar
                  um.
                </p>
                <p className="text-xs opacity-70">
                  Modelos do sistema são padrão e não podem ser editados.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
