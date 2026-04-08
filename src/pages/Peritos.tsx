import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar, Layers, Trash, Edit, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Peritos() {
  const [peritos, setPeritos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('Ativas')
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    especialidade: '',
    endereco: '',
    orcamento_previsto: 0,
    status: 'Ativo',
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchPeritos = async () => {
    const { data } = await supabase
      .from('peritos')
      .select('*, lancamentos(*)')
      .order('created_at', { ascending: false })
    if (data) setPeritos(data)
  }

  useEffect(() => {
    fetchPeritos()
  }, [])

  const handleSave = async () => {
    if (!form.nome)
      return toast({ title: 'Erro', description: 'Nome obrigatório', variant: 'destructive' })
    const { error } = await supabase.from('peritos').insert([form])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Perito cadastrado!' })
      setIsOpen(false)
      setForm({ nome: '', especialidade: '', endereco: '', orcamento_previsto: 0, status: 'Ativo' })
      fetchPeritos()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este perito?')) return
    await supabase.from('peritos').delete().eq('id', id)
    fetchPeritos()
  }

  const filtered = peritos.filter((p) => {
    const isAtiva = p.status !== 'Arquivado'
    const matchesTab = tab === 'Ativas' ? isAtiva : !isAtiva
    return matchesTab && p.nome.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-200 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setTab('Ativas')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'Ativas' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-foreground'}`}
          >
            Ativas
          </button>
          <button
            onClick={() => setTab('Arquivadas')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'Arquivadas' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-foreground'}`}
          >
            Arquivadas
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border"
            />
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Perito Associado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    value={form.especialidade}
                    onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço / Local</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Orçamento Previsto (R$)</Label>
                  <Input
                    type="number"
                    value={form.orcamento_previsto}
                    onChange={(e) =>
                      setForm({ ...form, orcamento_previsto: Number(e.target.value) })
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleSave}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((perito) => {
          const despesas =
            perito.lancamentos
              ?.filter((l: any) => l.Status === 'despesa' || l.tipo === 'despesa')
              .reduce((a: number, c: any) => a + Number(c.valor), 0) || 0
          const orcamento = Number(perito.orcamento_previsto) || 1
          const pct = Math.min(100, Math.round((despesas / orcamento) * 100))
          const formattedDespesas = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(despesas)
          const formattedOrcamento = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Number(perito.orcamento_previsto) || 0)

          return (
            <div
              key={perito.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-foreground">{perito.nome}</h3>
                <span className="px-3 py-1 text-[11px] rounded-full border border-primary text-primary font-medium tracking-wide">
                  {perito.status === 'Ativo' ? 'Em Execução' : perito.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{perito.endereco || 'Local não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Início:{' '}
                    {perito.data_inicio ? format(new Date(perito.data_inicio), 'dd/MM/yyyy') : '--'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gasto ({pct}%)</span>
                  <span className="font-medium text-foreground">
                    {formattedDespesas} / {formattedOrcamento}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-4 border-t border-border/50 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-secondary/50"
                  onClick={() => navigate(`/peritos/${perito.id}`)}
                >
                  <Layers className="w-4 h-4 mr-2" /> Cronograma
                </Button>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleDelete(perito.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-foreground text-background hover:bg-foreground/90 font-medium px-4"
                    onClick={() => navigate(`/peritos/${perito.id}`)}
                  >
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum perito encontrado nesta aba.
          </div>
        )}
      </div>
    </div>
  )
}
