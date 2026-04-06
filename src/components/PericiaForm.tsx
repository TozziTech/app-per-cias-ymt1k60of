import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import { usePericias } from '@/contexts/PericiasContext'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  ChecklistSection,
  CustomCheckbox,
} from './FormFields'

const formSchema = z.object({
  status: z.string().optional().default('Agendado'),
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
  justicaGratuita: z.boolean().default(false),
  peritoAssociado: z.string().optional(),
  descricaoImpugnacao: z.string().optional(),
  dataImpugnacao: z.date().optional(),
  diasImpugnacao: z.string().optional(),
  prazoEntrega: z.date().optional(),
  entregaImpugnacao: z.date().optional(),
  limitesEsclarecimentos: z.string().optional(),
  entregaEsclarecimentos: z.date().optional(),
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
      status: 'Agendado',
      justicaGratuita: false,
      peritoAssociado: '',
      descricaoImpugnacao: '',
      dataImpugnacao: undefined,
      diasImpugnacao: '',
      prazoEntrega: undefined,
      entregaImpugnacao: undefined,
      limitesEsclarecimentos: '',
      entregaEsclarecimentos: undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addPericia({
        ...values,
        dataNomeacao: values.dataNomeacao ? format(values.dataNomeacao, 'yyyy-MM-dd') : '',
        dataPericia: values.dataPericia ? format(values.dataPericia, 'yyyy-MM-dd') : '',
        dataEntregaLaudo: values.dataEntregaLaudo
          ? format(values.dataEntregaLaudo, 'yyyy-MM-dd')
          : '',
        dataImpugnacao: values.dataImpugnacao
          ? format(values.dataImpugnacao, 'yyyy-MM-dd')
          : undefined,
        prazoEntrega: values.prazoEntrega ? format(values.prazoEntrega, 'yyyy-MM-dd') : undefined,
        entregaImpugnacao: values.entregaImpugnacao
          ? format(values.entregaImpugnacao, 'yyyy-MM-dd')
          : undefined,
        entregaEsclarecimentos: values.entregaEsclarecimentos
          ? format(values.entregaEsclarecimentos, 'yyyy-MM-dd')
          : undefined,
        honorarios: values.honorarios ? parseFloat(values.honorarios.replace(',', '.')) : undefined,
        diasImpugnacao: values.diasImpugnacao ? parseInt(values.diasImpugnacao, 10) : undefined,
        status: (values.status || 'Agendado') as any,
      })

      toast({ title: 'Sucesso', description: 'Nova perícia cadastrada com sucesso.' })
      form.reset()
      onSuccess()
    } catch (error) {
      // Error is handled in the context
    }
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
          <CustomSelect
            control={form.control}
            name="status"
            label="Status"
            options={['Agendado', 'Em Andamento', 'Laudo Entregue', 'Concluído', 'Pendente']}
          />
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
          <CustomInput control={form.control} name="peritoAssociado" label="Perito Associado" />
          <CustomCheckbox control={form.control} name="justicaGratuita" label="Justiça Gratuita" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <h3 className="md:col-span-2 font-semibold text-lg">Impugnação e Esclarecimentos</h3>
          <CustomInput
            control={form.control}
            name="descricaoImpugnacao"
            label="Descrição da Impugnação"
          />
          <CustomDatePicker
            control={form.control}
            name="dataImpugnacao"
            label="Data da Impugnação"
          />
          <CustomInput
            control={form.control}
            name="diasImpugnacao"
            label="Dias Impugnação"
            type="number"
          />
          <CustomDatePicker control={form.control} name="prazoEntrega" label="Prazo de Entrega" />
          <CustomDatePicker
            control={form.control}
            name="entregaImpugnacao"
            label="Entrega da Impugnação"
          />
          <CustomInput
            control={form.control}
            name="limitesEsclarecimentos"
            label="Limites Esclarecimentos"
          />
          <CustomDatePicker
            control={form.control}
            name="entregaEsclarecimentos"
            label="Entrega Esclarecimentos"
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
