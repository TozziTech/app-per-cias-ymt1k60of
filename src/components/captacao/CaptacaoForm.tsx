import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createCaptacao, updateCaptacao, getCaptacoes } from '@/services/captacao'
import { supabase } from '@/lib/supabase/client'

const schema = z.object({
  data_contato: z.string().min(1, 'Obrigatório'),
  nome_contato: z.string().min(1, 'Obrigatório'),
  instituicao: z.string().min(1, 'Obrigatório'),
  perito_id: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  status: z.string().min(1, 'Obrigatório'),
  data_retorno: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const toLocalStr = (d?: string | null) => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

interface CaptacaoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  captacaoId: string | null
  onSaved: () => void
}

export function CaptacaoForm({ open, onOpenChange, captacaoId, onSaved }: CaptacaoFormProps) {
  const [loading, setLoading] = useState(false)
  const [peritos, setPeritos] = useState<{ id: string; nome: string }[]>([])
  const { toast } = useToast()

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    supabase
      .from('peritos')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => data && setPeritos(data))
  }, [])

  useEffect(() => {
    if (open) {
      if (captacaoId) {
        getCaptacoes().then((data) => {
          const item = data.find((c) => c.id === captacaoId)
          if (item)
            form.reset({
              ...item,
              data_contato: toLocalStr(item.data_contato),
              data_retorno: toLocalStr(item.data_retorno),
              perito_id: item.perito_id || 'none',
            })
        })
      } else {
        form.reset({
          data_contato: toLocalStr(new Date().toISOString()),
          status: 'Pendente',
          nome_contato: '',
          instituicao: '',
          perito_id: 'none',
          telefone: '',
          email: '',
          data_retorno: '',
          observacoes: '',
        })
      }
    }
  }, [open, captacaoId, form])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        perito_id: data.perito_id === 'none' ? null : data.perito_id,
        data_retorno: data.data_retorno ? new Date(data.data_retorno).toISOString() : null,
        data_contato: new Date(data.data_contato).toISOString(),
      }
      if (captacaoId) await updateCaptacao(captacaoId, payload)
      else await createCaptacao(payload)
      toast({ title: 'Sucesso', description: 'Registro salvo.' })
      onSaved()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{captacaoId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Contato</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
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
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Agendado">Agendado</SelectItem>
                        <SelectItem value="Convertido">Convertido</SelectItem>
                        <SelectItem value="Recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instituicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartório / Escritório</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1º Ofício Cível..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nome_contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa contatada" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perito_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perito Associado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {peritos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data_retorno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retorno Agendado (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Registro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
