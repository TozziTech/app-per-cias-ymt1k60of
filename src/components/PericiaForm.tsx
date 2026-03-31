import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { usePericias } from '@/contexts/PericiasContext'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  titulo: z.string().min(5, 'Título muito curto'),
  descricao: z.string().min(10, 'Descrição muito curta'),
  responsavel: z.string().min(3, 'Nome do responsável obrigatório'),
  dataLimite: z.date({
    required_error: 'Data limite é obrigatória',
  }),
})

export function PericiaForm({ onSuccess }: { onSuccess: () => void }) {
  const { addPericia } = usePericias()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      responsavel: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addPericia({
      titulo: values.titulo,
      descricao: values.descricao,
      responsavel: values.responsavel,
      dataLimite: format(values.dataLimite, 'yyyy-MM-dd'),
      dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    })

    toast({
      title: 'Sucesso',
      description: 'Nova perícia cadastrada com sucesso.',
    })

    form.reset()
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Caso</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Vistoria Estrutural..." {...field} />
              </FormControl>
              <FormMessage />
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
                <Textarea placeholder="Detalhes da perícia..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engenheiro Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do engenheiro..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataLimite"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Limite</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>Selecione uma data</span>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Cadastrar Perícia
          </Button>
        </div>
      </form>
    </Form>
  )
}
