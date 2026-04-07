import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { usePericias } from '@/contexts/PericiasContext'
import { Lancamento } from '@/lib/types'

const schema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  data: z.string().min(1, 'Data é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.preprocess((val) => Number(val), z.number().min(0.01, 'Valor deve ser maior que 0')),
  status: z.enum(['pendente', 'pago', 'recebido']),
  pericia_id: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface LancamentoFormProps {
  isOpen: boolean
  onClose: () => void
  lancamento?: Lancamento
  onSave: (data: Partial<Lancamento>) => Promise<void>
}

export function LancamentoForm({ isOpen, onClose, lancamento, onSave }: LancamentoFormProps) {
  const { pericias } = usePericias()

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
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (lancamento) {
        form.reset({
          tipo: lancamento.tipo,
          data: lancamento.data ? new Date(lancamento.data).toISOString().split('T')[0] : '',
          categoria: lancamento.categoria,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          status: lancamento.status,
          pericia_id: lancamento.pericia_id || 'none',
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
        })
      }
    }
  }, [isOpen, lancamento, form])

  const onSubmit = async (values: FormValues) => {
    const dataToSave = {
      ...values,
      pericia_id: values.pericia_id === 'none' ? null : values.pericia_id,
      data: new Date(values.data).toISOString(),
    }
    await onSave(dataToSave)
  }

  const tipo = form.watch('tipo')
  const categorias =
    tipo === 'receita'
      ? ['Honorários', 'Reembolso', 'Outras Receitas']
      : ['Deslocamento', 'Materiais', 'Taxas', 'Alimentação', 'Outras Despesas']

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <FormLabel className="font-normal cursor-pointer text-emerald-600">
                          Receita
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="despesa" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-rose-600">
                          Despesa
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
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
                        {categorias.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Detalhes do lançamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pericia_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perícia Vinculada (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma perícia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {pericias.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.numeroProcesso || p.codigoInterno || 'Sem número'} - {p.vara}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
