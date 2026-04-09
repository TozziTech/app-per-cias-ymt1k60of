import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Trash, Edit, Search, Plus, X } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Peritos() {
  const [peritos, setPeritos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('Ativas')
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoadingCode, setIsLoadingCode] = useState(false)

  const [estados, setEstados] = useState<any[]>([])
  const [selectedEstados, setSelectedEstados] = useState<string[]>([])
  const [cidadesPorEstado, setCidadesPorEstado] = useState<Record<string, any[]>>({})
  const [selectedCidades, setSelectedCidades] = useState<string[]>([])

  const emptyForm = {
    nome: '',
    especialidade: '',
    codigo_id: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    crea: '',
    area_atuacao: '',
    endereco: '',
    numero: '',
    cep: '',
    bairro: '',
    cidade_estado: '',
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
    const { data } = await supabase.from('peritos').select('*')
    if (data) {
      const sorted = data.sort((a, b) => {
        const idA = a.codigo_id || ''
        const idB = b.codigo_id || ''
        return idA.localeCompare(idB)
      })
      setPeritos(sorted)
    }
  }

  useEffect(() => {
    fetchPeritos()
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then((r) => r.json())
      .then((data) => setEstados(data))
      .catch((e) => console.error('Erro ao buscar estados:', e))
  }, [])

  useEffect(() => {
    selectedEstados.forEach((uf) => {
      if (!cidadesPorEstado[uf]) {
        fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
        )
          .then((r) => r.json())
          .then((data) => setCidadesPorEstado((prev) => ({ ...prev, [uf]: data })))
          .catch((e) => console.error(`Erro ao buscar cidades de ${uf}:`, e))
      }
    })
  }, [selectedEstados])

  useEffect(() => {
    if (isOpen && !editingId) {
      const fetchNextCodigo = async () => {
        setIsLoadingCode(true)
        try {
          const { data } = await supabase
            .from('peritos')
            .select('codigo_id')
            .ilike('codigo_id', 'PER-%')

          if (data && data.length > 0) {
            const nums = data
              .map((p) => parseInt(p.codigo_id?.replace('PER-', '') || '0', 10))
              .filter((n) => !isNaN(n))
            const maxNum = Math.max(0, ...nums)
            setForm((prev) => ({
              ...prev,
              codigo_id: `PER-${String(maxNum + 1).padStart(3, '0')}`,
            }))
          } else {
            setForm((prev) => ({ ...prev, codigo_id: 'PER-001' }))
          }
        } catch (error) {
          console.error('Erro ao buscar próximo código:', error)
        } finally {
          setIsLoadingCode(false)
        }
      }
      fetchNextCodigo()
    }
  }, [isOpen, editingId])

  const parseAreaAtuacao = (str: string) => {
    const ufSet = new Set<string>()
    const cityArr: string[] = []
    if (str) {
      str.split(' | ').forEach((part) => {
        const [ufPart, citiesPart] = part.split(': ')
        if (ufPart) {
          const uf = ufPart.replace(' (Todo o estado)', '').trim()
          ufSet.add(uf)
          if (citiesPart) {
            citiesPart.split(', ').forEach((city) => {
              cityArr.push(`${uf}-${city.trim()}`)
            })
          }
        }
      })
    }
    setSelectedEstados(Array.from(ufSet))
    setSelectedCidades(cityArr)
  }

  const formatAreaAtuacao = () => {
    const result: string[] = []
    selectedEstados.forEach((uf) => {
      const cities = selectedCidades
        .filter((sc) => sc.startsWith(`${uf}-`))
        .map((sc) => sc.substring(uf.length + 1))
      if (cities.length > 0) {
        result.push(`${uf}: ${cities.join(', ')}`)
      } else {
        result.push(`${uf} (Todo o estado)`)
      }
    })
    return result.join(' | ')
  }

  const handleCepChange = async (val: string) => {
    setForm((prev) => ({ ...prev, cep: val }))
    const cleanCep = val.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setForm((prev) => ({
            ...prev,
            endereco: data.logradouro || prev.endereco,
            bairro: data.bairro || prev.bairro,
            cidade_estado:
              `${data.localidade || ''}/${data.uf || ''}`.replace(/^\/|\/$/g, '') ||
              prev.cidade_estado,
          }))
        }
      } catch (e) {
        console.error('Erro ao buscar CEP:', e)
      }
    }
  }

  const handleSave = async () => {
    if (!form.nome)
      return toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })

    const areaFinal = formatAreaAtuacao()
    const payload = { ...form, area_atuacao: areaFinal }
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

      if (!insertError) {
        try {
          const emailToUse = payload.email || `perito-${Date.now()}@portal.com`
          await supabase.functions.invoke('create-user', {
            body: { email: emailToUse, name: payload.nome, role: 'Perito Associado' },
          })
        } catch (err) {
          console.error('Erro ao criar usuário para o perito:', err)
        }
      }
    }

    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        toast({
          title: 'Código Duplicado',
          description:
            'Este Código ID já foi utilizado. Feche e abra o formulário novamente para gerar um novo.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      }
    } else {
      toast({
        title: 'Sucesso',
        description: editingId ? 'Perito atualizado!' : 'Perito cadastrado!',
      })
      setIsOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      setSelectedEstados([])
      setSelectedCidades([])
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
      area_atuacao: p.area_atuacao || '',
      endereco: p.endereco || '',
      numero: p.numero || '',
      cep: p.cep || '',
      bairro: p.bairro || '',
      cidade_estado: p.cidade_estado || '',
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
    parseAreaAtuacao(p.area_atuacao || '')
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
    const s = search.toLowerCase()
    return (
      matchesTab &&
      (p.nome?.toLowerCase().includes(s) ||
        p.area_atuacao?.toLowerCase().includes(s) ||
        p.cidade_estado?.toLowerCase().includes(s))
    )
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
              placeholder="Buscar por nome, área ou cidade..."
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
                setSelectedEstados([])
                setSelectedCidades([])
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Novo Perito
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="px-6 py-4 border-b shrink-0">
                <DialogTitle>{editingId ? 'Editar Perito' : 'Novo Perito Associado'}</DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6">
                <Tabs defaultValue="dados" className="py-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="dados">Dados Principais</TabsTrigger>
                    <TabsTrigger value="area">Área de Atuação</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          value={isLoadingCode ? 'Gerando...' : form.codigo_id}
                          readOnly
                          className="bg-muted font-mono"
                          onChange={(e) => setForm({ ...form, codigo_id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Especialidade</Label>
                        <datalist id="especialidades-list">
                          <option value="Engenharia Civil" />
                          <option value="Engenharia Mecânica" />
                          <option value="Engenharia Elétrica" />
                          <option value="Engenharia Ambiental" />
                          <option value="Engenharia de Segurança do Trabalho" />
                          <option value="Arquitetura" />
                          <option value="Medicina" />
                          <option value="Contabilidade" />
                        </datalist>
                        <Input
                          list="especialidades-list"
                          placeholder="Selecione ou digite..."
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
                      <div className="space-y-2 md:col-span-2">
                        <Label>Data de Nascimento</Label>
                        <Input
                          type="date"
                          value={form.data_nascimento}
                          onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                        />
                      </div>

                      <div className="col-span-full font-semibold text-primary/80 mt-4">
                        Contato e Endereço
                      </div>
                      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            onChange={(e) =>
                              setForm({ ...form, telefone_alternativo: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div className="space-y-2 sm:col-span-2 md:col-span-1">
                          <Label>CEP</Label>
                          <Input
                            value={form.cep}
                            onChange={(e) => handleCepChange(e.target.value)}
                            placeholder="00000-000"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2 md:col-span-3">
                          <Label>Endereço (Logradouro)</Label>
                          <Input
                            value={form.endereco}
                            onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                          <Label>Nr.</Label>
                          <Input
                            value={form.numero}
                            onChange={(e) => setForm({ ...form, numero: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-1 md:col-span-1">
                          <Label>Bairro</Label>
                          <Input
                            value={form.bairro}
                            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2 md:col-span-2">
                          <Label>Cidade/Estado</Label>
                          <Input
                            value={form.cidade_estado}
                            onChange={(e) => setForm({ ...form, cidade_estado: e.target.value })}
                          />
                        </div>
                      </div>

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
                  </TabsContent>

                  <TabsContent value="area" className="space-y-6">
                    <div>
                      <Label className="text-base">Estados (UF)</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Selecione os estados onde o perito atua:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 bg-muted/30 p-4 rounded-lg border">
                        {estados.map((uf) => (
                          <label
                            key={uf.sigla}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                          >
                            <Checkbox
                              checked={selectedEstados.includes(uf.sigla)}
                              onCheckedChange={(c) => {
                                if (c) setSelectedEstados([...selectedEstados, uf.sigla])
                                else {
                                  setSelectedEstados(selectedEstados.filter((s) => s !== uf.sigla))
                                  setSelectedCidades(
                                    selectedCidades.filter((sc) => !sc.startsWith(`${uf}-`)),
                                  )
                                }
                              }}
                            />
                            <span className="text-sm font-medium">{uf.sigla}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {selectedEstados.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-base">Cidades Específicas</Label>
                        <p className="text-sm text-muted-foreground">
                          Selecione as cidades. Caso não selecione nenhuma, consideraremos atuação
                          em todo o estado.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEstados.map((uf) => (
                            <div key={uf} className="p-4 border rounded-lg bg-card shadow-sm">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Badge variant="outline">{uf}</Badge>
                                Cidades
                              </h4>
                              <Select
                                onValueChange={(val) => {
                                  if (!selectedCidades.includes(`${uf}-${val}`)) {
                                    setSelectedCidades([...selectedCidades, `${uf}-${val}`])
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Adicionar cidade..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {cidadesPorEstado[uf]?.map((c) => (
                                    <SelectItem key={c.nome} value={c.nome}>
                                      {c.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {selectedCidades
                                  .filter((sc) => sc.startsWith(`${uf}-`))
                                  .map((sc) => {
                                    const cityName = sc.substring(uf.length + 1)
                                    return (
                                      <Badge
                                        key={sc}
                                        variant="secondary"
                                        className="flex items-center gap-1.5 py-1"
                                      >
                                        {cityName}
                                        <button
                                          onClick={() =>
                                            setSelectedCidades(
                                              selectedCidades.filter((x) => x !== sc),
                                            )
                                          }
                                          className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-0.5"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </Badge>
                                    )
                                  })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              <div className="p-4 border-t shrink-0 flex justify-end bg-background">
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
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-foreground truncate" title={perito.nome}>
                  {perito.nome}
                </h3>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p
                    className="text-sm text-muted-foreground truncate"
                    title={perito.especialidade}
                  >
                    {perito.especialidade || 'Especialidade não informada'}
                  </p>
                  {perito.area_atuacao && (
                    <p
                      className="text-xs text-muted-foreground line-clamp-2 mt-0.5"
                      title={perito.area_atuacao}
                    >
                      Área: {perito.area_atuacao}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {perito.codigo_id && (
                  <Badge variant="outline" className="text-xs font-medium bg-primary/5">
                    ID: {perito.codigo_id}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mt-1">
              {perito.crea && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    CREA: {perito.crea}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{perito.telefone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span
                  className="line-clamp-2"
                  title={[
                    perito.endereco,
                    perito.numero,
                    perito.bairro,
                    perito.cidade_estado,
                    perito.cep,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                >
                  {[perito.endereco, perito.numero, perito.bairro, perito.cidade_estado, perito.cep]
                    .filter(Boolean)
                    .join(', ') || 'Local não informado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate" title={perito.email}>
                  {perito.email || 'Sem e-mail'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/50 gap-2">
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
