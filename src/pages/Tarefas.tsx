import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, CalendarIcon, Search, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/TaskCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatTarefa } from '@/components/ChatTarefa'
import { TarefaRelatorio } from '@/components/TarefaRelatorio'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Tarefa } from '@/lib/types'

const schema = z.object({
  titulo: z.string().min(1, 'Obrigatório'),
  descricao: z.string().optional(),
  status: z.string().min(1, 'Obrigatório'),
  pericia_id: z.string().optional(),
  responsavel_id: z.string().optional(),
  perito_associado_id: z.string().optional(),
  data_entrega: z.date().optional(),
})
type FormData = z.infer<typeof schema>

const COLUMNS = ['Pendente', 'Em Andamento', 'Concluída']

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [pericias, setPericias] = useState<{ id: string; numero_processo: string }[]>([])
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tarefa | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { titulo: '', descricao: '', status: 'Pendente' },
  })

  const loadData = async () => {
    setLoading(true)
    const [tRes, pRes, rRes] = await Promise.all([
      supabase
        .from('tarefas')
        .select('*, pericia:pericias(numero_processo)')
        .order('created_at', { ascending: false }),
      supabase.from('pericias').select('id, numero_processo'),
      supabase.from('profiles').select('id, name'),
    ])

    if (tRes.data && rRes.data) {
      const profilesMap = new Map(rRes.data.map((p) => [p.id, p.name]))
      const mappedTasks = tRes.data.map((t) => ({
        ...t,
        responsavel: t.responsavel_id ? { name: profilesMap.get(t.responsavel_id) } : null,
        perito: t.perito_associado_id ? { name: profilesMap.get(t.perito_associado_id) } : null,
      }))
      setTarefas(mappedTasks as unknown as Tarefa[])
    }
    if (pRes.data) setPericias(pRes.data)
    if (rRes.data) setProfiles(rRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        pericia_id: data.pericia_id || null,
        responsavel_id: data.responsavel_id || null,
        perito_associado_id: data.perito_associado_id || null,
        data_entrega: data.data_entrega ? data.data_entrega.toISOString() : null,
      }
      const { error } = editing
        ? await supabase.from('tarefas').update(payload).eq('id', editing.id)
        : await supabase.from('tarefas').insert([payload])
      if (error) throw error

      if (
        payload.perito_associado_id &&
        (!editing || editing.perito_associado_id !== payload.perito_associado_id)
      ) {
        supabase.functions
          .invoke('notify-webhook', {
            body: { type: 'INSERT', table: 'tarefas', record: payload },
          })
          .catch(console.error)
      }

      toast({ title: 'Sucesso!' })
      setOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleEdit = (t: Tarefa) => {
    setEditing(t)
    form.reset({
      titulo: t.titulo,
      descricao: t.descricao || '',
      status: t.status,
      pericia_id: t.pericia_id || undefined,
      responsavel_id: t.responsavel_id || undefined,
      perito_associado_id: t.perito_associado_id || undefined,
      data_entrega: t.data_entrega ? new Date(t.data_entrega) : undefined,
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir?')) return
    await supabase.from('tarefas').delete().eq('id', id)
    loadData()
  }

  const toggleStatus = async (t: Tarefa, finalizado: boolean) => {
    const newStatus = finalizado ? 'Concluída' : 'Em Andamento'
    await supabase.from('tarefas').update({ finalizado, status: newStatus }).eq('id', t.id)
    setTarefas((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, finalizado, status: newStatus } : x)),
    )
  }

  const filteredTarefas = tarefas.filter((t) => {
    const s = searchTerm.toLowerCase()
    return (
      t.titulo.toLowerCase().includes(s) ||
      t.responsavel?.name?.toLowerCase().includes(s) ||
      t.perito?.name?.toLowerCase().includes(s) ||
      t.pericia?.numero_processo?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie o fluxo de trabalho e prazos da equipe.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val)
            if (!val) {
              setEditing(null)
              form.reset({ titulo: '', descricao: '', status: 'Pendente' })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="detalhes" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="chat" disabled={!editing}>
                  Chat Interno
                </TabsTrigger>
                <TabsTrigger value="relatorio" disabled={!editing}>
                  Relatório
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="titulo"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pericia_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Processo Vinculado</FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === 'none' ? undefined : val)
                              }
                              value={field.value || 'none'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Nenhum (Tarefa Avulsa)</SelectItem>
                                {pericias.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.numero_processo || 'Sem número'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                <SelectItem value="Concluída">Concluída</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="responsavel_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável (Gestor)</FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === 'none' ? undefined : val)
                              }
                              value={field.value || 'none'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {profiles.map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.name || 'Sem nome'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="perito_associado_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Perito Associado (Executor)</FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === 'none' ? undefined : val)
                              }
                              value={field.value || 'none'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {profiles.map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.name || 'Sem nome'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="data_entrega"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="mb-2">Data de Entrega</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground',
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'dd/MM/yyyy')
                                    ) : (
                                      <span>Selecione</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit">Salvar Tarefa</Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {editing && (
                <TabsContent value="chat" className="mt-0">
                  <ChatTarefa tarefaId={editing.id} />
                </TabsContent>
              )}

              {editing && (
                <TabsContent value="relatorio" className="mt-0">
                  <TarefaRelatorio tarefaId={editing.id} />
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar por título, responsável, processo..."
          className="pl-9 bg-white dark:bg-zinc-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTarefas.filter((t) => t.status === col)
            return (
              <div
                key={col}
                className="flex flex-col bg-zinc-100/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{col}</h3>
                  <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800">
                    {colTasks.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        t={t}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={toggleStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
