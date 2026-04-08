import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Pencil, Trash2, CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  data_entrega: z.date().optional(),
})
type FormData = z.infer<typeof schema>

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [pericias, setPericias] = useState<{ id: string; numero_processo: string }[]>([])
  const [responsaveis, setResponsaveis] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tarefa | null>(null)
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
        .select('*, pericia:pericias(numero_processo), responsavel:profiles(name)')
        .order('created_at', { ascending: false }),
      supabase.from('pericias').select('id, numero_processo'),
      supabase.from('profiles').select('id, name'),
    ])
    if (tRes.data) setTarefas(tRes.data as unknown as Tarefa[])
    if (pRes.data) setPericias(pRes.data)
    if (rRes.data) setResponsaveis(rRes.data)
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
        data_entrega: data.data_entrega ? data.data_entrega.toISOString() : null,
      }
      const { error } = editing
        ? await supabase.from('tarefas').update(payload).eq('id', editing.id)
        : await supabase.from('tarefas').insert([payload])
      if (error) throw error
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
    await supabase
      .from('tarefas')
      .update({ finalizado, status: finalizado ? 'Concluída' : 'Pendente' })
      .eq('id', t.id)
    setTarefas((prev) =>
      prev.map((x) =>
        x.id === t.id ? { ...x, finalizado, status: finalizado ? 'Concluída' : 'Pendente' } : x,
      ),
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie as tarefas vinculadas aos processos.</p>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pericia_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processo</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)}
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
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
                    name="responsavel_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)}
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {responsaveis.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name || 'Sem nome'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Finalizado</TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Processo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : tarefas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma tarefa
                </TableCell>
              </TableRow>
            ) : (
              tarefas.map((t) => (
                <TableRow key={t.id} className={cn(t.finalizado && 'opacity-60 bg-muted/50')}>
                  <TableCell>
                    <Switch checked={t.finalizado} onCheckedChange={(v) => toggleStatus(t, v)} />
                  </TableCell>
                  <TableCell>
                    <div className={cn('font-medium', t.finalizado && 'line-through')}>
                      {t.titulo}
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {t.descricao}
                    </div>
                  </TableCell>
                  <TableCell>{t.pericia?.numero_processo || '-'}</TableCell>
                  <TableCell>{t.responsavel?.name || '-'}</TableCell>
                  <TableCell className="text-sm">
                    <div>Criado: {format(new Date(t.created_at), 'dd/MM/yyyy')}</div>
                    {t.data_entrega && (
                      <div>Entrega: {format(new Date(t.data_entrega), 'dd/MM/yyyy')}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
