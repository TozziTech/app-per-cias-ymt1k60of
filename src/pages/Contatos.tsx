import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Plus, Trash, Phone, Mail, MapPin, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { exportToCsv } from '@/lib/export'

export default function Contatos() {
  const [contatos, setContatos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    tipo: 'Advogado',
    nome: '',
    telefone: '',
    telefone_celular: '',
    telefone_alternativo: '',
    email: '',
    endereco: '',
    codigo_id: '',
    observacoes: '',
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
      setForm({
        tipo: 'Advogado',
        nome: '',
        telefone: '',
        telefone_celular: '',
        telefone_alternativo: '',
        email: '',
        endereco: '',
        codigo_id: '',
        observacoes: '',
      })
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
      (c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.codigo_id && c.codigo_id.toLowerCase().includes(search.toLowerCase()))),
  )

  const handleExportExcel = () => {
    exportToCsv(
      'contatos.csv',
      filtered.map((c) => ({
        Nome: c.nome,
        Tipo: c.tipo,
        Telefone: c.telefone,
        Celular: c.telefone_celular,
        Alternativo: c.telefone_alternativo,
        Email: c.email,
        Endereço: c.endereco,
        'Código ID': c.codigo_id,
        Observações: c.observacoes,
      })),
    )
  }

  const uniqueTipos = ['Todos', ...Array.from(new Set(contatos.map((c) => c.tipo))).filter(Boolean)]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista Telefônica</h1>
          <p className="text-muted-foreground">
            Gerencie contatos de cartórios, advogados, clientes e peritos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Novo Contato</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Tipo</Label>
                  <Input
                    list="tipos-contato"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    placeholder="Selecione ou digite novo..."
                  />
                  <datalist id="tipos-contato">
                    <option value="Cartório" />
                    <option value="Advogado" />
                    <option value="Cliente" />
                    <option value="Perito" />
                    <option value="Outros" />
                  </datalist>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome *</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Fixo</Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Celular</Label>
                  <Input
                    value={form.telefone_celular}
                    onChange={(e) => setForm({ ...form, telefone_celular: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tel. Alternativo</Label>
                  <Input
                    value={form.telefone_alternativo}
                    onChange={(e) => setForm({ ...form, telefone_alternativo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código ID</Label>
                  <Input
                    value={form.codigo_id}
                    onChange={(e) => setForm({ ...form, codigo_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Observações</Label>
                  <Input
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  />
                </div>
                <Button className="w-full md:col-span-2 mt-2" onClick={handleSave}>
                  Salvar Contato
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {uniqueTipos.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Endereço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {c.nome}
                    {c.codigo_id && (
                      <div className="text-xs text-muted-foreground mt-0.5">ID: {c.codigo_id}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                      {c.tipo}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {c.telefone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1.5" /> {c.telefone}
                        </div>
                      )}
                      {c.telefone_celular && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1.5" /> {c.telefone_celular} (Cel)
                        </div>
                      )}
                      {c.telefone_alternativo && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1.5" /> {c.telefone_alternativo} (Alt)
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {c.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1.5" /> {c.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate"
                    title={c.endereco}
                  >
                    {c.endereco && (
                      <div className="flex items-center truncate">
                        <MapPin className="w-3 h-3 mr-1.5 shrink-0" />{' '}
                        <span className="truncate">{c.endereco}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhum contato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
