import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import { usePericias } from '@/contexts/PericiasContext'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { CustomInput, CustomSelect, CustomDatePicker, ChecklistSection } from './FormFields'

const formSchema = z.object({
  codigoInterno: z.string().min(1, 'Código Interno é obrigatório'),
  numeroProcesso: z.string().min(1, 'Número do Processo é obrigatório'),
  juiz: z.string().optional(),
  advogadoAutora: z.string().optional(),
  advogadoRe: z.string().optional(),
  assistenteTecnicoAutora: z.string().optional(),
  assistenteTecnicoRe: z.string().optional(),
  vara: z.string().min(1, 'Vara é obrigatória'),
  cidade: z.string().optional(),
  dataNomeacao: z.date({ required_error: 'Obrigatório' }),
  dataPericia: z.date({ required_error: 'Obrigatório' }),
  dataEntregaLaudo: z.date({ required_error: 'Obrigatório' }),
  honorarios: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
  linkNuvem: z.string().url('Deve ser URL válida').or(z.literal('')).optional(),
  checklist: z.array(
    z.object({
      id: z.string(),
      texto: z.string().min(1, 'Texto obrigatório'),
      concluido: z.boolean().default(false),
    }),
  ),
})

export function PericiaForm({ onSuccess }: { onSuccess: () => void }) {
  const { addPericia } = usePericias()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoInterno: '',
      numeroProcesso: '',
      juiz: '',
      advogadoAutora: '',
      advogadoRe: '',
      assistenteTecnicoAutora: '',
      assistenteTecnicoRe: '',
      vara: '',
      cidade: '',
      honorarios: '',
      endereco: '',
      observacoes: '',
      linkNuvem: '',
      checklist: [],
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addPericia({
      ...values,
      dataNomeacao: format(values.dataNomeacao, 'yyyy-MM-dd'),
      dataPericia: format(values.dataPericia, 'yyyy-MM-dd'),
      dataEntregaLaudo: format(values.dataEntregaLaudo, 'yyyy-MM-dd'),
      honorarios: values.honorarios ? parseFloat(values.honorarios.replace(',', '.')) : undefined,
    })

    toast({ title: 'Sucesso', description: 'Nova perícia cadastrada com sucesso.' })
    form.reset()
    onSuccess()
  }

  const onError = () => {
    toast({
      title: 'Erro de Validação',
      description: 'Preencha os campos obrigatórios corretamente.',
      variant: 'destructive',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput control={form.control} name="codigoInterno" label="Código Interno*" />
          <CustomInput control={form.control} name="numeroProcesso" label="Número do Processo*" />
          <CustomSelect
            control={form.control}
            name="vara"
            label="Vara*"
            options={['Cível', 'Criminal', 'Trabalhista', 'Família', 'Outra']}
          />
          <CustomInput control={form.control} name="cidade" label="Cidade" />
          <CustomInput control={form.control} name="juiz" label="Juiz" />
          <CustomInput
            control={form.control}
            name="honorarios"
            label="Honorários Aprovados (R$)"
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <h3 className="md:col-span-2 font-semibold text-lg">Datas</h3>
          <CustomDatePicker control={form.control} name="dataNomeacao" label="Data de Nomeação*" />
          <CustomDatePicker control={form.control} name="dataPericia" label="Data da Perícia*" />
          <CustomDatePicker
            control={form.control}
            name="dataEntregaLaudo"
            label="Data de Entrega do Laudo*"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <h3 className="md:col-span-2 font-semibold text-lg">Envolvidos</h3>
          <CustomInput control={form.control} name="advogadoAutora" label="Advogado Autora" />
          <CustomInput control={form.control} name="advogadoRe" label="Advogado Ré" />
          <CustomInput
            control={form.control}
            name="assistenteTecnicoAutora"
            label="Assistente Técnico Autora"
          />
          <CustomInput
            control={form.control}
            name="assistenteTecnicoRe"
            label="Assistente Técnico Ré"
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Detalhes</h3>
          <CustomInput control={form.control} name="endereco" label="Endereço" />
          <CustomInput control={form.control} name="observacoes" label="Observações" />
          <CustomInput
            control={form.control}
            name="linkNuvem"
            label="Link Nuvem (Google Drive, etc.)"
            placeholder="https://"
          />
        </div>

        <ChecklistSection control={form.control} />

        <div className="pt-4 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Salvar Perícia
          </Button>
        </div>
      </form>
    </Form>
  )
}
