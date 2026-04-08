import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'

import { usePericias } from '@/contexts/PericiasContext'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Pericia } from '@/lib/types'
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
  justicaGratuita: z.boolean().default(false),
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
  contato_perito_id: z.string().optional().nullable(),
  peritoAssociado: z.string().optional(),
  descricaoImpugnacao: z.string().optional(),
  dataImpugnacao: z.date().optional().nullable(),
  diasImpugnacao: z.string().optional(),
  prazoEntrega: z.date().optional().nullable(),
  entregaImpugnacao: z.date().optional().nullable(),
  limitesEsclarecimentos: z.string().optional(),
  entregaEsclarecimentos: z.date().optional().nullable(),
  checklist: z.array(
    z.object({
      id: z.string(),
      texto: z.string().min(1, 'Texto obrigatório'),
      concluido: z.boolean().default(false),
    }),
  ),
})

export function PericiaForm({
  pericia,
  onSuccess,
}: {
  pericia?: Pericia | null
  onSuccess: () => void
}) {
  const { addPericia, updatePericia } = usePericias()
  const { toast } = useToast()
  const [peritos, setPeritos] = useState<{ id: string; nome: string; tipo: string }[]>([])

  useEffect(() => {
    supabase
      .from('contatos')
      .select('id, nome, tipo')
      .order('nome')
      .then(({ data }) => {
        if (data) {
          setPeritos(
            data.filter((c) => c.tipo === 'Perito' || c.tipo === 'Advogado' || c.tipo === 'Outros'),
          )
        }
      })
  }, [])

  const parseDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return undefined
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? undefined : new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Agendado',
      codigoInterno: '',
      numeroProcesso: '',
      justicaGratuita: false,
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
      contato_perito_id: '',
      peritoAssociado: '',
      descricaoImpugnacao: '',
      diasImpugnacao: '',
      limitesEsclarecimentos: '',
    },
  })

  useEffect(() => {
    if (pericia) {
      form.reset({
        status: pericia.status || 'Agendado',
        codigoInterno: pericia.codigoInterno || '',
        numeroProcesso: pericia.numeroProcesso || '',
        justicaGratuita: pericia.justicaGratuita || false,
        juiz: pericia.juiz || '',
        advogadoAutora: pericia.advogadoAutora || '',
        advogadoRe: pericia.advogadoRe || '',
        assistenteTecnicoAutora: pericia.assistenteTecnicoAutora || '',
        assistenteTecnicoRe: pericia.assistenteTecnicoRe || '',
        vara: pericia.vara || '',
        cidade: pericia.cidade || '',
        dataNomeacao: parseDateSafe(pericia.dataNomeacao),
        dataPericia: parseDateSafe(pericia.dataPericia),
        dataEntregaLaudo: parseDateSafe(pericia.dataEntregaLaudo),
        honorarios: pericia.honorarios ? pericia.honorarios.toString() : '',
        endereco: pericia.endereco || '',
        observacoes: pericia.observacoes || '',
        linkNuvem: pericia.linkNuvem || '',
        contato_perito_id: pericia.contato_perito_id || '',
        peritoAssociado: pericia.peritoAssociado || '',
        descricaoImpugnacao: pericia.descricaoImpugnacao || '',
        dataImpugnacao: parseDateSafe(pericia.dataImpugnacao),
        diasImpugnacao: pericia.diasImpugnacao ? pericia.diasImpugnacao.toString() : '',
        prazoEntrega: parseDateSafe(pericia.prazoEntrega),
        entregaImpugnacao: parseDateSafe(pericia.entregaImpugnacao),
        limitesEsclarecimentos: pericia.limitesEsclarecimentos || '',
        entregaEsclarecimentos: parseDateSafe(pericia.entregaEsclarecimentos),
        checklist: pericia.checklist || [],
      })
    }
  }, [pericia, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
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
        contato_perito_id: values.contato_perito_id || null,
      }

      if (pericia) {
        await updatePericia(pericia.id, payload)
        toast({ title: 'Sucesso', description: 'Perícia atualizada com sucesso.' })
      } else {
        await addPericia(payload)
        toast({ title: 'Sucesso', description: 'Nova perícia cadastrada com sucesso.' })
      }
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
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            control={form.control}
            name="status"
            label="Status"
            options={['Agendado', 'Em Andamento', 'Laudo Entregue', 'Concluído', 'Pendente']}
          />
          <CustomInput control={form.control} name="codigoInterno" label="Código Interno*" />
          <CustomInput control={form.control} name="numeroProcesso" label="Número do Processo*" />
          <div className="flex items-end pb-2">
            <CustomCheckbox
              control={form.control}
              name="justicaGratuita"
              label="Justiça Gratuita"
            />
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Datas Principais</h3>
          <CustomDatePicker control={form.control} name="dataNomeacao" label="Data de Nomeação*" />
          <CustomDatePicker control={form.control} name="dataPericia" label="Data da Perícia*" />
          <CustomDatePicker
            control={form.control}
            name="dataEntregaLaudo"
            label="Data de Entrega do Laudo*"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Envolvidos</h3>
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
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Perito / Profissional Associado
            </label>
            <select
              {...form.register('contato_perito_id')}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione da lista de contatos...</option>
              {peritos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.tipo})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6 bg-muted/20 p-4 rounded-lg">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Impugnação</h3>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6 bg-muted/20 p-4 rounded-lg">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Esclarecimentos</h3>
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

        <div className="space-y-4 border-t border-primary/20 pt-6">
          <h3 className="font-semibold text-lg text-primary">Detalhes Adicionais</h3>
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

        <div className="pt-6 flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            {pericia ? 'Salvar Alterações' : 'Cadastrar Perícia'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
