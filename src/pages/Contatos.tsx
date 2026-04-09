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
import { Search, Plus, Trash, Phone, Mail, MapPin, Download, Pencil, Filter } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Columns3 } from 'lucide-react'
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

const defaultForm = {
  tipo: 'Advogado',
  nome: '',
  telefone: '',
  telefone_celular: '',
  telefone_alternativo: '',
  email: '',
  endereco: '',
  codigo_id: '',
  observacoes: '',
}

export default function Contatos() {
  const [contatos, setContatos] = useState<any[]>([])
  const [search, setSearch] = useState(() => sessionStorage.getItem('contatos_search') || '')
  const [tipoFilter, setTipoFilter] = useState(
    () => sessionStorage.getItem('contatos_tipoFilter') || 'Todos',
  )
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<{ id?: string } & typeof defaultForm>(defaultForm)
  const [startDate, setStartDate] = useState(
    () => sessionStorage.getItem('contatos_startDate') || '',
  )
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem('contatos_endDate') || '')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('contatos_columns')
    if (saved) return JSON.parse(saved)
    return {
      tipo: true,
      contatos: true,
      email: true,
      endereco: true,
    }
  })
  const { toast } = useToast()

  useEffect(() => {
    sessionStorage.setItem('contatos_search', search)
    sessionStorage.setItem('contatos_tipoFilter', tipoFilter)
    sessionStorage.setItem('contatos_startDate', startDate)
    sessionStorage.setItem('contatos_endDate', endDate)
  }, [search, tipoFilter, startDate, endDate])

  useEffect(() => {
    localStorage.setItem('contatos_columns', JSON.stringify(visibleColumns))
  }, [visibleColumns])

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

    const dataToSave = { ...form }
    delete dataToSave.id

    if (form.id) {
      const { error } = await supabase.from('contatos').update(dataToSave).eq('id', form.id)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Contato atualizado!' })
        setIsOpen(false)
        setForm(defaultForm)
        fetchContatos()
      }
    } else {
      const { error } = await supabase.from('contatos').insert([dataToSave])
      if (error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Contato salvo!' })
        setIsOpen(false)
        setForm(defaultForm)
        fetchContatos()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este contato?')) return
    await supabase.from('contatos').delete().eq('id', id)
    fetchContatos()
  }

  const filtered = contatos.filter((c) => {
    let matchesDate = true
    if (startDate || endDate) {
      const dateStr = String(c.created_at).substring(0, 10)
      if (startDate && dateStr < startDate) matchesDate = false
      if (endDate && dateStr > endDate) matchesDate = false
    }

    return (
      (tipoFilter === 'Todos' || c.tipo === tipoFilter) &&
      (c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.codigo_id && c.codigo_id.toLowerCase().includes(search.toLowerCase()))) &&
      matchesDate
    )
  })

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
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) setForm(defaultForm)
            }}
          >
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-sm" onClick={() => setForm({ ...defaultForm })}>
                <Plus className="w-4 h-4 mr-2" /> Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{form.id ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
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
                    placeholder="Auto se vazio"
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto shrink-0"
              size="icon"
              title="Colunas"
            >
              <Columns3 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={visibleColumns.tipo}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, tipo: checked }))
              }
            >
              Tipo
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.contatos}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, contatos: checked }))
              }
            >
              Contatos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.email}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, email: checked }))
              }
            >
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.endereco}
              onCheckedChange={(checked) =>
                setVisibleColumns((prev) => ({ ...prev, endereco: checked }))
              }
            >
              Endereço
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto shrink-0"
              size="icon"
              title="Filtros Avançados"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" /> Filtros por Criação
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-destructive"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  Limpar Datas
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                {visibleColumns.tipo && <TableHead>Tipo</TableHead>}
                {visibleColumns.contatos && <TableHead>Contatos</TableHead>}
                {visibleColumns.email && (
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                )}
                {visibleColumns.endereco && (
                  <TableHead className="hidden lg:table-cell">Endereço</TableHead>
                )}
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
                  {visibleColumns.tipo && (
                    <TableCell>
                      <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                        {c.tipo}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.contatos && (
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
                  )}
                  {visibleColumns.email && (
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {c.email && (
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1.5" /> {c.email}
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.endereco && (
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
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setForm(c)
                          setIsOpen(true)
                        }}
                        className="text-primary hover:bg-muted h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
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
