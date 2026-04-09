import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'

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
  codigoInterno: z.string().optional(),
  numeroProcesso: z.string().optional(),
  justicaGratuita: z.boolean().default(false),
  juiz: z.string().optional(),
  advogadoAutora: z.string().optional(),
  advogadoRe: z.string().optional(),
  assistenteTecnicoAutora: z.string().optional(),
  assistenteTecnicoRe: z.string().optional(),
  vara: z.string().optional(),
  cidade: z.string().optional(),
  dataNomeacao: z.date().optional().nullable(),
  dataAceite: z.date().optional().nullable(),
  dataPericia: z.date().optional().nullable(),
  dataEntregaLaudo: z.date().optional().nullable(),
  honorarios: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
  linkNuvem: z.string().url('Deve ser URL válida').or(z.literal('')).optional(),
  perito_id: z.string().optional().nullable(),
  peritoAssociado: z.string().optional(),
  descricaoImpugnacao: z.string().optional(),
  dataImpugnacao: z.date().optional().nullable(),
  diasImpugnacao: z.string().optional(),
  prazoEntrega: z.date().optional().nullable(),
  entregaImpugnacao: z.date().optional().nullable(),
  limitesEsclarecimentos: z.string().optional(),
  entregaEsclarecimentos: z.date().optional().nullable(),
  honorariosParcelados: z.boolean().default(false),
  quantidadeParcelas: z.string().optional(),
  adiantamentoSolicitado: z.boolean().default(false),
  aceite: z.string().optional().default('Pendente'),
  justificativa_recusa: z.string().optional(),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        texto: z.string().min(1, 'Texto obrigatório'),
        concluido: z.boolean().default(false),
      }),
    )
    .optional()
    .default([]),
})

export function PericiaForm({
  pericia,
  onSuccess,
}: {
  pericia?: Pericia | null
  onSuccess: () => void
}) {
  const { addPericia, updatePericia, deletePericia } = usePericias()
  const { toast } = useToast()
  const [peritos, setPeritos] = useState<{ id: string; nome: string; tipo: string }[]>([])

  useEffect(() => {
    supabase
      .from('peritos')
      .select('id, nome, especialidade')
      .order('nome')
      .then(({ data }) => {
        if (data) {
          setPeritos(
            data.map((p) => ({ id: p.id, nome: p.nome, tipo: p.especialidade || 'Perito' })),
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
      checklist: pericia?.checklist || [],
      perito_id: '',
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
        dataAceite: parseDateSafe(pericia.dataAceite),
        dataPericia: parseDateSafe(pericia.dataPericia),
        dataEntregaLaudo: parseDateSafe(pericia.dataEntregaLaudo),
        honorarios: pericia.honorarios ? pericia.honorarios.toString() : '',
        endereco: pericia.endereco || '',
        observacoes: pericia.observacoes || '',
        linkNuvem: pericia.linkNuvem || '',
        perito_id: pericia.perito_id || '',
        peritoAssociado: pericia.peritoAssociado || '',
        descricaoImpugnacao: pericia.descricaoImpugnacao || '',
        dataImpugnacao: parseDateSafe(pericia.dataImpugnacao),
        diasImpugnacao: pericia.diasImpugnacao ? pericia.diasImpugnacao.toString() : '',
        prazoEntrega: parseDateSafe(pericia.prazoEntrega),
        entregaImpugnacao: parseDateSafe(pericia.entregaImpugnacao),
        limitesEsclarecimentos: pericia.limitesEsclarecimentos || '',
        entregaEsclarecimentos: parseDateSafe(pericia.entregaEsclarecimentos),
        honorariosParcelados: pericia.honorariosParcelados || false,
        quantidadeParcelas: pericia.quantidadeParcelas ? pericia.quantidadeParcelas.toString() : '',
        adiantamentoSolicitado: pericia.adiantamentoSolicitado || false,
        aceite: pericia.aceite || 'Pendente',
        justificativa_recusa: pericia.justificativa_recusa || '',
        checklist: pericia.checklist || [],
      })
    }
  }, [pericia, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        dataNomeacao: values.dataNomeacao ? format(values.dataNomeacao, 'yyyy-MM-dd') : null,
        dataAceite: values.dataAceite ? format(values.dataAceite, 'yyyy-MM-dd') : null,
        dataPericia: values.dataPericia ? format(values.dataPericia, 'yyyy-MM-dd') : null,
        dataEntregaLaudo: values.dataEntregaLaudo
          ? format(values.dataEntregaLaudo, 'yyyy-MM-dd')
          : null,
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
        honorariosParcelados: values.honorariosParcelados,
        quantidadeParcelas: values.quantidadeParcelas
          ? parseInt(values.quantidadeParcelas, 10)
          : undefined,
        adiantamentoSolicitado: values.adiantamentoSolicitado,
        aceite: values.aceite,
        justificativa_recusa: values.aceite === 'Recusado' ? values.justificativa_recusa : null,
        status: (values.status || 'Agendado') as any,
        perito_id: values.perito_id || null,
        peritoAssociado:
          peritos.find((p) => p.id === values.perito_id)?.nome || values.peritoAssociado,
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
      description: 'Verifique os campos preenchidos.',
      variant: 'destructive',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8 pt-4 pb-12">
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg border border-border">
          <CustomSelect
            control={form.control}
            name="aceite"
            label="Aprovação do Cadastro"
            options={['Pendente', 'Aceito', 'Recusado']}
          />
          {form.watch('aceite') === 'Recusado' && (
            <CustomInput
              control={form.control}
              name="justificativa_recusa"
              label="Justificativa da Recusa"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="codigoInterno"
            label="Código Interno"
            placeholder="Gerado automaticamente"
            disabled
          />
          <CustomSelect
            control={form.control}
            name="status"
            label="Status"
            options={[
              'Agendado',
              'Em Andamento',
              'Laudo Entregue',
              'Concluído',
              'Pendente',
              'Recusada',
            ]}
          />
          <CustomInput control={form.control} name="numeroProcesso" label="Número do Processo" />
          <CustomSelect
            control={form.control}
            name="vara"
            label="Vara"
            options={[
              'Vara Civil',
              'Vara da Fazenda',
              '1ª Vara',
              '2ª Vara',
              '3ª Vara',
              '4ª Vara',
              '5ª Vara',
              '6ª Vara',
              '7ª Vara',
              '8ª Vara',
              '9ª Vara',
              '10ª Vara',
              'Outra',
            ]}
          />
          <CustomInput control={form.control} name="cidade" label="Cidade" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6 bg-muted/20 p-4 rounded-lg">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Honorários</h3>
          <CustomInput
            control={form.control}
            name="honorarios"
            label="Honorários Aprovados (R$)"
            placeholder="0.00"
          />
          <div className="flex items-center sm:mt-8">
            <CustomCheckbox
              control={form.control}
              name="justicaGratuita"
              label="Justiça Gratuita"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 md:col-span-2 p-3 bg-background rounded-md border border-border">
            <CustomCheckbox
              control={form.control}
              name="honorariosParcelados"
              label="Honorários Parcelados?"
            />
            {form.watch('honorariosParcelados') && (
              <div className="w-32">
                <CustomInput
                  control={form.control}
                  name="quantidadeParcelas"
                  label="Qtd. Parcelas"
                  type="number"
                />
              </div>
            )}
            <CustomCheckbox
              control={form.control}
              name="adiantamentoSolicitado"
              label="Solicitação de Adiantamento (50%)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Datas Principais</h3>
          <CustomDatePicker control={form.control} name="dataNomeacao" label="Data de Nomeação" />
          <CustomDatePicker control={form.control} name="dataAceite" label="Data do Aceite" />
          <CustomDatePicker control={form.control} name="dataPericia" label="Data da Perícia" />
          <CustomDatePicker
            control={form.control}
            name="dataEntregaLaudo"
            label="Data de Entrega do Laudo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-primary/20 pt-6">
          <h3 className="md:col-span-2 font-semibold text-lg text-primary">Envolvidos</h3>
          <CustomInput control={form.control} name="juiz" label="Juiz" />
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Perito / Profissional Associado
            </label>
            <select
              {...form.register('perito_id')}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione do módulo de peritos...</option>
              {peritos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.tipo ? `(${p.tipo})` : ''}
                </option>
              ))}
            </select>
          </div>
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
          <CustomInput control={form.control} name="endereco" label="Endereço da Perícia" />
          <CustomInput control={form.control} name="observacoes" label="Observações" />
          <CustomInput
            control={form.control}
            name="linkNuvem"
            label="Link Nuvem (Google Drive, etc.)"
            placeholder="https://"
          />
        </div>

        <ChecklistSection control={form.control} />

        <div className="pt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          {pericia ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={async () => {
                if (
                  confirm('Deseja realmente excluir esta perícia? Esta ação não pode ser desfeita.')
                ) {
                  try {
                    await deletePericia(pericia.id)
                    toast({ title: 'Sucesso', description: 'Perícia excluída com sucesso.' })
                    onSuccess()
                  } catch (e) {
                    toast({
                      title: 'Erro',
                      description: 'Falha ao excluir perícia.',
                      variant: 'destructive',
                    })
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Perícia
            </Button>
          ) : (
            <div />
          )}
          <Button type="submit" className="w-full sm:w-auto">
            {pericia ? 'Salvar Alterações' : 'Cadastrar Perícia'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
