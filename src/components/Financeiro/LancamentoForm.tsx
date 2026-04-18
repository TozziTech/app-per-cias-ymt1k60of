import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { usePericias } from '@/contexts/PericiasContext'
import { Lancamento } from '@/lib/types'
import { logFormErrors } from '@/lib/error-logger'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  data: z.string().min(1, 'Data é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  novaCategoria: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.preprocess((val) => Number(val), z.number().min(0.01, 'Valor > 0')),
  status: z.enum(['pendente', 'pago', 'recebido']),
  pericia_id: z.string().optional().nullable(),
  responsavel_id: z.string().optional().nullable(),
  recorrente: z.boolean().default(false),
  frequencia_recorrencia: z.string().optional().nullable(),
  parcelas: z.preprocess(
    (val) => (val ? Number(val) : null),
    z.number().min(1).optional().nullable(),
  ),
  anexo: z.any().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  lancamento?: Lancamento
  onSave: (data: Partial<Lancamento>[]) => Promise<void>
}

export function LancamentoForm({ isOpen, onClose, lancamento, onSave }: Props) {
  const { pericias } = usePericias()
  const auth = useAuth() as any
  const user = auth?.user
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([])
  const [categorias, setCategorias] = useState<{ nome: string; tipo: string }[]>([])
  const [uploading, setUploading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'receita',
      data: new Date().toISOString().split('T')[0],
      categoria: '',
      descricao: '',
      valor: 0,
      status: 'pendente',
      pericia_id: 'none',
      responsavel_id: 'none',
      recorrente: false,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    supabase
      .from('profiles')
      .select('id, name')
      .then(({ data }) => setProfiles(data || []))
    supabase
      .from('lancamento_categorias')
      .select('nome, tipo')
      .then(({ data }) => setCategorias(data || []))

    if (lancamento) {
      form.reset({
        tipo: lancamento.tipo,
        data: lancamento.data ? new Date(lancamento.data).toISOString().split('T')[0] : '',
        categoria: lancamento.categoria,
        descricao: lancamento.descricao,
        valor: lancamento.valor,
        status: lancamento.status,
        pericia_id: lancamento.pericia_id || 'none',
        responsavel_id: lancamento.responsavel_id || 'none',
        recorrente: false,
      })
    } else {
      form.reset({
        tipo: 'receita',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
        descricao: '',
        valor: 0,
        status: 'pendente',
        pericia_id: 'none',
        responsavel_id: 'none',
        recorrente: false,
      })
    }
  }, [isOpen, lancamento, form])

  const onSubmit = async (values: FormValues) => {
    setUploading(true)
    let anexoData = null
    if (values.anexo && values.anexo.length > 0) {
      const file = values.anexo[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error } = await supabase.storage.from('lancamentos').upload(fileName, file)
      if (!error) {
        const { data } = supabase.storage.from('lancamentos').getPublicUrl(fileName)
        anexoData = { url: data.publicUrl, name: file.name }
      }
    }
    setUploading(false)

    let finalCat = values.categoria
    if (values.categoria === 'nova_categoria' && values.novaCategoria) {
      finalCat = values.novaCategoria
      await supabase
        .from('lancamento_categorias')
        .insert({ nome: values.novaCategoria, tipo: values.tipo })
    }

    const baseData = {
      tipo: values.tipo,
      categoria: finalCat,
      descricao: values.descricao,
      valor: values.valor,
      status: values.status,
      pericia_id: values.pericia_id === 'none' ? null : values.pericia_id,
      responsavel_id: values.responsavel_id === 'none' ? null : values.responsavel_id,
      anexo_url: anexoData ? anexoData.url : lancamento?.anexo_url || null,
      anexo_nome: anexoData ? anexoData.name : lancamento?.anexo_nome || null,
    }

    const result = []
    if (values.recorrente && values.parcelas && values.parcelas > 1 && !lancamento) {
      let currentDate = new Date(values.data)
      for (let i = 0; i < values.parcelas; i++) {
        result.push({
          ...baseData,
          data: new Date(currentDate).toISOString(),
          recorrente: true,
          frequencia_recorrencia: values.frequencia_recorrencia,
          parcelas: values.parcelas,
          descricao: `${values.descricao} (${i + 1}/${values.parcelas})`,
        })
        if (values.frequencia_recorrencia === 'mensal')
          currentDate.setMonth(currentDate.getMonth() + 1)
        else if (values.frequencia_recorrencia === 'semanal')
          currentDate.setDate(currentDate.getDate() + 7)
        else if (values.frequencia_recorrencia === 'anual')
          currentDate.setFullYear(currentDate.getFullYear() + 1)
      }
    } else {
      result.push({ ...baseData, data: new Date(values.data).toISOString() })
    }
    await onSave(result)
  }

  const tipo = form.watch('tipo')
  const catFiltradas = categorias.filter((c) => c.tipo === tipo)
  const isNovaCat = form.watch('categoria') === 'nova_categoria'
  const isRecorrente = form.watch('recorrente')

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              logFormErrors('lancamento-form', err, user?.id)
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="receita" />
                        </FormControl>
                        <FormLabel className="text-emerald-500 cursor-pointer">Receita</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="despesa" />
                        </FormControl>
                        <FormLabel className="text-destructive cursor-pointer">Despesa</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {catFiltradas.map((c) => (
                          <SelectItem key={c.nome} value={c.nome}>
                            {c.nome}
                          </SelectItem>
                        ))}
                        <SelectItem value="nova_categoria" className="text-primary font-medium">
                          + Nova Categoria
                        </SelectItem>
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
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value={tipo === 'receita' ? 'recebido' : 'pago'}>
                          {tipo === 'receita' ? 'Recebido' : 'Pago'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {isNovaCat && (
              <FormField
                control={form.control}
                name="novaCategoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Nova Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite a categoria..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Detalhes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsavel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Não informado</SelectItem>
                        {profiles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pericia_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perícia (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {pericias.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.numeroProcesso || 'Sem número'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {!lancamento && (
              <div className="border border-border rounded-md p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="recorrente"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel className="text-base cursor-pointer">
                        Lançamento Recorrente?
                      </FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {isRecorrente && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequencia_recorrencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                              <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parcelas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nº de Parcelas</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="anexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anexo (Recibo/NF)</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                  </FormControl>
                  {lancamento?.anexo_url && (
                    <p className="text-xs text-primary mt-1">
                      Anexo atual:{' '}
                      <a
                        href={lancamento.anexo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {lancamento.anexo_nome}
                      </a>
                    </p>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
                {form.formState.isSubmitting || uploading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
