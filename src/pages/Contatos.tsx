import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Trash, Phone, Mail, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Contatos() {
  const [contatos, setContatos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    tipo: 'Advogado',
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
  })
  const { toast } = useToast()

  const fetchContatos = async () => {
    const { data } = await supabase.from('contatos').select('*').order('nome')
    if (data) setContatos(data)
  }

  useEffect(() => {
    fetchContatos()
  }, [])

  const handleSave = async () => {
    if (!form.nome)
      return toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })
    const { error } = await supabase.from('contatos').insert([form])
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso', description: 'Contato salvo!' })
      setIsOpen(false)
      setForm({ tipo: 'Advogado', nome: '', telefone: '', email: '', endereco: '' })
      fetchContatos()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este contato?')) return
    await supabase.from('contatos').delete().eq('id', id)
    fetchContatos()
  }

  const filtered = contatos.filter(
    (c) =>
      (tipoFilter === 'Todos' || c.tipo === tipoFilter) &&
      c.nome.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista Telefônica</h1>
          <p className="text-muted-foreground">
            Gerencie contatos de cartórios, advogados, clientes, etc.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Cartório', 'Advogado', 'Cliente', 'Perito', 'Outros'].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
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
                <Label>Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSave}>
                Salvar Contato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os tipos</SelectItem>
            <SelectItem value="Cartório">Cartórios</SelectItem>
            <SelectItem value="Advogado">Advogados</SelectItem>
            <SelectItem value="Cliente">Clientes</SelectItem>
            <SelectItem value="Perito">Peritos</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="relative group">
            <CardContent className="p-5 space-y-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                onClick={() => handleDelete(c.id)}
              >
                <Trash className="w-4 h-4" />
              </Button>
              <div>
                <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10 mb-2 inline-block">
                  {c.tipo}
                </span>
                <h3 className="font-semibold text-lg leading-tight">{c.nome}</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {c.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {c.telefone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {c.email}
                  </div>
                )}
                {c.endereco && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> <span className="truncate">{c.endereco}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Nenhum contato encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
