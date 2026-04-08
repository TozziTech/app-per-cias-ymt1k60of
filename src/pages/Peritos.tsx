import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Trash, Edit, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
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
  const [editingId, setEditingId] = useState<string | null>(null)

  const emptyForm = {
    nome: '',
    especialidade: '',
    codigo_id: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    crea: '',
    endereco: '',
    telefone: '',
    telefone_alternativo: '',
    email: '',
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    observacoes: '',
    status: 'Ativo',
  }

  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchPeritos = async () => {
    const { data } = await supabase
      .from('peritos')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPeritos(data)
  }

  useEffect(() => {
    fetchPeritos()
  }, [])

  const handleSave = async () => {
    if (!form.nome)
      return toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })

    const payload = { ...form }
    if (!payload.data_nascimento) delete (payload as any).data_nascimento

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from('peritos')
        .update(payload)
        .eq('id', editingId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('peritos').insert([payload])
      error = insertError
    }

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso',
        description: editingId ? 'Perito atualizado!' : 'Perito cadastrado!',
      })
      setIsOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchPeritos()
    }
  }

  const handleEdit = (p: any) => {
    setForm({
      nome: p.nome || '',
      especialidade: p.especialidade || '',
      codigo_id: p.codigo_id || '',
      cpf: p.cpf || '',
      rg: p.rg || '',
      data_nascimento: p.data_nascimento || '',
      crea: p.crea || '',
      endereco: p.endereco || '',
      telefone: p.telefone || '',
      telefone_alternativo: p.telefone_alternativo || '',
      email: p.email || '',
      chave_pix: p.chave_pix || '',
      banco: p.banco || '',
      agencia: p.agencia || '',
      conta: p.conta || '',
      observacoes: p.observacoes || '',
      status: p.status || 'Ativo',
    })
    setEditingId(p.id)
    setIsOpen(true)
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
          <Dialog
            open={isOpen}
            onOpenChange={(val) => {
              setIsOpen(val)
              if (!val) {
                setEditingId(null)
                setForm(emptyForm)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Novo Perito
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Perito' : 'Novo Perito Associado'}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Dados Profissionais */}
                  <div className="col-span-full font-semibold text-primary/80 mt-2">
                    Dados Profissionais
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Código ID</Label>
                    <Input
                      value={form.codigo_id}
                      onChange={(e) => setForm({ ...form, codigo_id: e.target.value })}
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
                    <Label>CREA</Label>
                    <Input
                      value={form.crea}
                      onChange={(e) => setForm({ ...form, crea: e.target.value })}
                    />
                  </div>

                  {/* Dados Pessoais */}
                  <div className="col-span-full font-semibold text-primary/80 mt-4">
                    Dados Pessoais
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input
                      value={form.rg}
                      onChange={(e) => setForm({ ...form, rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={form.data_nascimento}
                      onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                    />
                  </div>

                  {/* Contato e Endereço */}
                  <div className="col-span-full font-semibold text-primary/80 mt-4">
                    Contato e Endereço
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Celular</Label>
                    <Input
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Alternativo</Label>
                    <Input
                      value={form.telefone_alternativo}
                      onChange={(e) => setForm({ ...form, telefone_alternativo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-full">
                    <Label>Endereço Completo</Label>
                    <Input
                      value={form.endereco}
                      onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    />
                  </div>

                  {/* Dados Bancários */}
                  <div className="col-span-full font-semibold text-primary/80 mt-4">
                    Dados Bancários
                  </div>
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      value={form.banco}
                      onChange={(e) => setForm({ ...form, banco: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chave Pix</Label>
                    <Input
                      value={form.chave_pix}
                      onChange={(e) => setForm({ ...form, chave_pix: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agência</Label>
                    <Input
                      value={form.agencia}
                      onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      value={form.conta}
                      onChange={(e) => setForm({ ...form, conta: e.target.value })}
                    />
                  </div>

                  {/* Observações */}
                  <div className="col-span-full font-semibold text-primary/80 mt-4">
                    Outras Informações
                  </div>
                  <div className="space-y-2 col-span-full">
                    <Label>Observações</Label>
                    <Textarea
                      value={form.observacoes}
                      onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 border-t flex justify-end">
                <Button onClick={handleSave} className="w-full sm:w-auto">
                  Salvar Perito
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((perito) => (
          <div
            key={perito.id}
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{perito.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {perito.especialidade || 'Especialidade não informada'}
                </p>
              </div>
              {perito.codigo_id && (
                <Badge variant="outline" className="text-xs shrink-0">
                  ID: {perito.codigo_id}
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{perito.telefone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate" title={perito.endereco}>
                  {perito.endereco || 'Local não informado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="truncate" title={perito.email}>
                  {perito.email || 'Sem e-mail'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end mt-3 pt-4 border-t border-border/50 gap-2">
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
                onClick={() => handleEdit(perito)}
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
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum perito encontrado nesta aba.
          </div>
        )}
      </div>
    </div>
  )
}
