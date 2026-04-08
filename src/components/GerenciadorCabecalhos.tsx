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
import { LayoutTemplate, Plus, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface GerenciadorCabecalhosProps {
  cabecalhos: any[]
  onCabecalhosChange: () => void
}

export function GerenciadorCabecalhos({
  cabecalhos,
  onCabecalhosChange,
}: GerenciadorCabecalhosProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [vara, setVara] = useState('')
  const [cidade, setCidade] = useState('')
  const [conteudo, setConteudo] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  const handleEdit = (c: any) => {
    setEditingId(c.id)
    setVara(c.vara)
    setCidade(c.cidade || '')
    setConteudo(c.conteudo)
  }

  const handleNew = () => {
    setEditingId('new')
    setVara('')
    setCidade('')
    setConteudo(
      'EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [VARA] DA COMARCA DE [CIDADE]\n\nProcesso nº: [NÚMERO DO PROCESSO]\n\n[NOME DO PERITO], Perito(a) do Juízo, devidamente qualificado(a) nos autos do processo em epígrafe, vem, respeitosamente, à presença de Vossa Excelência,',
    )
  }

  const handleSave = async () => {
    if (!vara || !conteudo) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Vara e conteúdo são obrigatórios.',
      })
      return
    }
    const isNew = editingId === 'new'

    if (isNew) {
      const { error } = await supabase.from('cabecalhos_vara').insert({
        vara,
        cidade: cidade || null,
        conteudo,
        user_id: user?.id,
      })
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message })
        return
      }
    } else {
      const { error } = await supabase
        .from('cabecalhos_vara')
        .update({
          vara,
          cidade: cidade || null,
          conteudo,
        })
        .eq('id', editingId)
      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message })
        return
      }
    }

    toast({ title: 'Sucesso', description: 'Cabeçalho salvo com sucesso!' })
    setEditingId(null)
    onCabecalhosChange()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('cabecalhos_vara').delete().eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message })
    } else {
      toast({ title: 'Sucesso', description: 'Cabeçalho excluído.' })
      if (editingId === id) setEditingId(null)
      onCabecalhosChange()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-background">
          <LayoutTemplate className="h-4 w-4 mr-2" /> Cabeçalhos por Vara
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Personalizar Cabeçalhos por Vara</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 mt-4">
          <div className="w-full md:w-1/3 flex flex-col gap-2 border-r pr-4 overflow-y-auto">
            <Button variant="secondary" onClick={handleNew} className="w-full mb-2 shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Novo Cabeçalho
            </Button>
            {cabecalhos.map((c) => (
              <div
                key={c.id}
                className={`flex flex-col gap-2 p-3 border rounded-md hover:bg-muted/50 ${editingId === c.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-medium leading-tight truncate">{c.vara}</span>
                    {c.cidade && (
                      <span className="text-xs text-muted-foreground truncate">{c.cidade}</span>
                    )}
                  </div>
                  <div className="flex items-center shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(c)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pl-2">
            {editingId ? (
              <>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium">Nome da Vara (ex: 1ª Vara Cível)</label>
                    <Input
                      value={vara}
                      onChange={(e) => setVara(e.target.value)}
                      placeholder="1ª Vara Cível"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium">Cidade (opcional)</label>
                    <Input
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md border shrink-0">
                  <span className="font-semibold mb-1 block">Tags disponíveis:</span>
                  <div className="flex flex-wrap gap-1">
                    <code className="bg-background px-1 py-0.5 rounded border">[VARA]</code>
                    <code className="bg-background px-1 py-0.5 rounded border">[CIDADE]</code>
                    <code className="bg-background px-1 py-0.5 rounded border">
                      [NÚMERO DO PROCESSO]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border">
                      [NOME DO PERITO]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border">
                      [CPF DO PERITO]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border">
                      [REGISTRO PROFISSIONAL]
                    </code>
                    <code className="bg-background px-1 py-0.5 rounded border">
                      [ENDEREÇO PROFISSIONAL]
                    </code>
                  </div>
                </div>
                <Textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed resize-none p-4"
                  placeholder="Escreva o cabeçalho personalizado..."
                />
                <div className="flex justify-end gap-2 shrink-0 pt-2">
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>Salvar Cabeçalho</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center space-y-4">
                <LayoutTemplate className="h-12 w-12 opacity-20" />
                <p className="text-sm max-w-[250px]">
                  Crie cabeçalhos específicos que serão aplicados automaticamente de acordo com a
                  Vara e Cidade do processo.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
