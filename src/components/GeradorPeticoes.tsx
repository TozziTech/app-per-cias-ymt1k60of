import { useState, useEffect } from 'react'
import { Pericia } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Copy, FileText, Loader2, FileDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { valorPorExtenso } from '@/lib/extenso'
import { GerenciadorTemplates } from './GerenciadorTemplates'

interface GeradorPeticoesProps {
  pericia: Pericia
}

const STATIC_TEMPLATES = [
  {
    id: 'honorarios',
    nome: 'Petição Pedido de Honorários',
    conteudo:
      '[CABEÇALHO]\n\napresentar sua proposta de honorários periciais para a realização dos trabalhos técnicos necessários à lide.\n\nApós detida análise dos autos e considerando a complexidade da matéria, o tempo estimado para as diligências, estudos, pesquisas e elaboração do laudo, estima-se o valor dos honorários periciais em [VALOR_HONORARIOS] [VALOR_EXTENSO].\n\nRequer, outrossim, a intimação das partes para manifestação acerca da presente proposta e, havendo concordância, que seja determinado o depósito integral do valor para posterior início dos trabalhos.\n\n[RODAPE]',
  },
  {
    id: 'aceite',
    nome: 'Petição de Aceite',
    conteudo:
      '[CABEÇALHO]\n\ninformar que ACEITA o encargo para o qual foi nomeado(a), comprometendo-se a cumprir o mister com zelo, dedicação e imparcialidade, entregando o laudo no prazo assinalado por este juízo.\n\n[RODAPE]',
  },
  {
    id: 'agendamento',
    nome: 'Petição de Agendamento da Perícia',
    conteudo:
      '[CABEÇALHO]\n\ninformar que a vistoria técnica necessária para a elaboração do laudo pericial foi agendada para o dia [DATA_PERICIA], a ser realizada no seguinte local: [ENDERECO_PERICIA].\n\nRequer a intimação das partes e de seus respectivos assistentes técnicos para, querendo, acompanharem os trabalhos.\n\n[RODAPE]',
  },
  {
    id: 'recusa',
    nome: 'Petição de Recusa',
    conteudo:
      '[CABEÇALHO]\n\ninformar que, por motivos de foro íntimo (ou incompatibilidade técnica/impedimento), RECUSA o encargo para o qual foi nomeado(a) nestes autos.\n\nRequer a escusa do encargo e a nomeação de outro profissional para a realização dos trabalhos.\n\n[RODAPE]',
  },
  {
    id: 'documentacao',
    nome: 'Petição Pedido de Documentação',
    conteudo:
      '[CABEÇALHO]\n\ninformar que, para o regular andamento dos trabalhos periciais e elaboração do respectivo laudo, faz-se necessária a apresentação dos seguintes documentos pelas partes:\n\n1. [ESPECIFIQUE OS DOCUMENTOS AQUI]\n\nRequer a intimação das partes para que juntem aos autos os referidos documentos no prazo legal.\n\n[RODAPE]',
  },
  {
    id: 'liberacao_antecipada',
    nome: 'Petição de Liberação de Honorários Antecipado',
    conteudo:
      '[CABEÇALHO]\n\nrequerer a liberação de 50% (cinquenta por cento) dos honorários periciais depositados, a título de adiantamento para custeio das despesas iniciais e diligências necessárias à realização da perícia.\n\nRequer a expedição do competente alvará em favor deste(a) subscritor(a).\n\n[RODAPE]',
  },
  {
    id: 'prorrogacao',
    nome: 'Petição de Prorrogação de Prazo',
    conteudo:
      '[CABEÇALHO]\n\nrequerer a PRORROGAÇÃO DO PRAZO para entrega do laudo pericial por mais 30 (trinta) dias, face à complexidade da matéria, à necessidade de diligências complementares e ao grande volume de documentos a serem analisados, o que impossibilita a conclusão dos trabalhos no prazo originalmente assinalado.\n\n[RODAPE]',
  },
  {
    id: 'liberacao_final',
    nome: 'Petição de Liberação de Honorários',
    conteudo:
      '[CABEÇALHO]\n\ninformar que os trabalhos periciais foram devidamente concluídos, com a apresentação do laudo conclusivo e eventuais esclarecimentos.\n\nRequer, assim, a liberação do saldo remanescente dos honorários periciais depositados, com a expedição do competente alvará em favor deste(a) subscritor(a).\n\n[RODAPE]',
  },
]

export function GeradorPeticoes({ pericia }: GeradorPeticoesProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [peritoData, setPeritoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from('peticao_templates').select('*').order('nome')
      if (!error && data && data.length > 0) {
        // Garante que todos os templates estáticos estejam presentes, caso a migração falhe
        const mergedTemplates = [...data]
        const dbNames = data.map((t: any) => t.nome)

        STATIC_TEMPLATES.forEach((staticT) => {
          if (!dbNames.includes(staticT.nome)) {
            mergedTemplates.push({ ...staticT, is_system: true })
          }
        })

        setTemplates(mergedTemplates.sort((a, b) => a.nome.localeCompare(b.nome)))
      } else {
        setTemplates(STATIC_TEMPLATES)
      }
    } catch (err) {
      setTemplates(STATIC_TEMPLATES)
    }
  }

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      await fetchTemplates()
      if (pericia.perito_id) {
        const { data } = await supabase
          .from('peritos')
          .select('*')
          .eq('id', pericia.perito_id)
          .single()
        if (data) setPeritoData(data)
      }
      setIsLoading(false)
    }
    init()
  }, [pericia.perito_id])

  useEffect(() => {
    if (!selectedTemplate) {
      setGeneratedText('')
      return
    }

    const template = templates.find((t) => t.id === selectedTemplate)
    if (!template) return

    const dateToUse = pericia.dataPericia || (pericia as any).data_pericia
    let parsedDate = '[DATA_PERICIA]'
    if (dateToUse) {
      const d = new Date(dateToUse)
      if (!isNaN(d.getTime())) {
        parsedDate = d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      }
    }

    const dados = {
      vara: pericia.vara || '[VARA]',
      cidade: pericia.cidade || '[CIDADE]',
      numero_processo:
        pericia.numeroProcesso ||
        (pericia as any).numero_processo ||
        pericia.codigoInterno ||
        (pericia as any).codigo_interno ||
        '[NÚMERO DO PROCESSO]',
      perito:
        peritoData?.nome ||
        pericia.peritoAssociado ||
        (pericia as any).perito_associado ||
        '[NOME DO PERITO]',
      cpf: peritoData?.cpf || '[CPF DO PERITO]',
      crea: peritoData?.crea || '[REGISTRO PROFISSIONAL]',
      endereco_perito: peritoData?.endereco || '[ENDEREÇO PROFISSIONAL]',
      valor_honorarios: pericia.honorarios
        ? `R$ ${pericia.honorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '[VALOR_HONORARIOS]',
      valor_extenso: pericia.honorarios
        ? `(${valorPorExtenso(pericia.honorarios)})`
        : '[VALOR_EXTENSO]',
      data_pericia: parsedDate,
      endereco_pericia: pericia.endereco || '[ENDERECO_PERICIA]',
      data_atual: new Date().toLocaleDateString('pt-BR'),
    }

    const header = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${dados.vara.toUpperCase()} DA COMARCA DE ${dados.cidade.toUpperCase()}\n\nProcesso nº: ${dados.numero_processo}\n\n${dados.perito}, Perito(a) do Juízo, devidamente qualificado(a) nos autos do processo em epígrafe, portador(a) do CPF nº ${dados.cpf} e registro profissional nº ${dados.crea}, com endereço profissional em ${dados.endereco_perito}, vem, respeitosamente, à presença de Vossa Excelência, `

    const footer = `\n\nTermos em que,\nPede deferimento.\n\n${dados.cidade}, ${dados.data_atual}\n\n___________________________________________________\n${dados.perito}\nPerito(a) do Juízo\n${dados.crea}`

    let text = template.conteudo
      .replace(/\[CABEÇALHO\]/g, header)
      .replace(/\[RODAPE\]/g, footer)
      .replace(/\[VALOR_HONORARIOS\]/g, dados.valor_honorarios)
      .replace(/\[VALOR_EXTENSO\]/g, dados.valor_extenso)
      .replace(/\[DATA_PERICIA\]/g, dados.data_pericia)
      .replace(/\[ENDERECO_PERICIA\]/g, dados.endereco_pericia)

    setGeneratedText(text)
  }, [selectedTemplate, pericia, peritoData, templates])

  const handleCopy = () => {
    if (!generatedText) return
    navigator.clipboard.writeText(generatedText)
    toast({ title: 'Sucesso', description: 'Texto copiado para a área de transferência.' })
  }

  const handleDownloadDoc = () => {
    if (!generatedText) return
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>Petição</title></head>
      <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; text-align: justify;">
        ${generatedText.replace(/\n/g, '<br>')}
      </body>
      </html>
    `
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Peticao_${pericia.numeroProcesso || 'Sem_Numero'}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[350px]">
            <SelectValue
              placeholder={isLoading ? 'Carregando dados...' : 'Selecione o modelo de petição...'}
            />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <GerenciadorTemplates templates={templates} onTemplatesChange={fetchTemplates} />
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!generatedText}
            className="flex-1 sm:flex-none bg-background"
          >
            <Copy className="h-4 w-4 mr-2" /> Copiar
          </Button>
          <Button
            variant="default"
            onClick={handleDownloadDoc}
            disabled={!generatedText}
            className="flex-1 sm:flex-none"
          >
            <FileDown className="h-4 w-4 mr-2" /> Exportar DOC
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {selectedTemplate ? (
          <Textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            className="min-h-[500px] font-serif text-sm leading-relaxed resize-y bg-background"
            placeholder="O texto gerado aparecerá aqui..."
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium text-foreground">Gerador de Petições Inteligente</p>
            <p className="text-sm mt-2 max-w-sm">
              Selecione um modelo acima para gerar a petição automaticamente com os dados do
              processo e do seu perfil profissional.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
