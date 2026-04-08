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
import { Copy, Download, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

interface GeradorPeticoesProps {
  pericia: Pericia
}

const TEMPLATES = [
  { id: 'aceite', nome: 'Petição de Aceite' },
  { id: 'honorarios', nome: 'Petição de Honorários' },
  { id: 'agendamento', nome: 'Petição de Agendamento da Perícia' },
  { id: 'entrega_laudo', nome: 'Petição de Entrega de Laudo' },
  { id: 'prorrogacao', nome: 'Petição de Prorrogação de Prazo' },
]

const unidades = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
]
const dezenas = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
]
const centenas = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
]

function extenso(n: number): string {
  if (n === 100) return 'cem'
  if (n < 20) return unidades[n]
  if (n < 100) return dezenas[Math.floor(n / 10)] + (n % 10 !== 0 ? ' e ' + unidades[n % 10] : '')
  if (n < 1000)
    return centenas[Math.floor(n / 100)] + (n % 100 !== 0 ? ' e ' + extenso(n % 100) : '')
  if (n < 1000000) {
    const mil = Math.floor(n / 1000)
    const resto = n % 1000
    return (
      (mil === 1 ? 'mil' : extenso(mil) + ' mil') +
      (resto !== 0 ? (resto < 100 || resto % 100 === 0 ? ' e ' : ' ') + extenso(resto) : '')
    )
  }
  return n.toString()
}

function valorPorExtenso(valor: number): string {
  if (!valor || isNaN(valor) || valor <= 0) return ''
  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)
  let res = ''
  if (reais > 0) res += extenso(reais) + (reais === 1 ? ' real' : ' reais')
  if (centavos > 0) {
    if (res !== '') res += ' e '
    res += extenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return res
}

export function GeradorPeticoes({ pericia }: GeradorPeticoesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [peritoData, setPeritoData] = useState<any>(null)
  const [isLoadingPerito, setIsLoadingPerito] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPerito() {
      if (!pericia.perito_id) return
      setIsLoadingPerito(true)
      try {
        const { data, error } = await supabase
          .from('peritos')
          .select('*')
          .eq('id', pericia.perito_id)
          .single()
        if (!error && data) setPeritoData(data)
      } catch (err) {
        console.error('Erro ao buscar perito:', err)
      } finally {
        setIsLoadingPerito(false)
      }
    }
    fetchPerito()
  }, [pericia.perito_id])

  useEffect(() => {
    if (!selectedTemplate) {
      setGeneratedText('')
      return
    }

    const dados = {
      vara: pericia.vara || '[VARA]',
      cidade: pericia.cidade || '[CIDADE]',
      numero_processo: pericia.numeroProcesso || pericia.codigoInterno || '[NÚMERO DO PROCESSO]',
      perito: peritoData?.nome || pericia.peritoAssociado || '[NOME DO PERITO]',
      cpf: peritoData?.cpf || '[CPF DO PERITO]',
      crea: peritoData?.crea || '[REGISTRO PROFISSIONAL]',
      endereco_perito: peritoData?.endereco || '[ENDEREÇO PROFISSIONAL]',
      valor_honorarios: pericia.honorarios
        ? `R$ ${pericia.honorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '[VALOR]',
      valor_extenso: pericia.honorarios ? `(${valorPorExtenso(pericia.honorarios)})` : '',
      data_pericia: pericia.dataPericia
        ? new Date(pericia.dataPericia).toLocaleDateString('pt-BR')
        : '[DATA DA PERÍCIA]',
      endereco_pericia: pericia.endereco || '[ENDEREÇO DA VISTORIA]',
      data_atual: new Date().toLocaleDateString('pt-BR'),
    }

    const header = `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${dados.vara.toUpperCase()} DA COMARCA DE ${dados.cidade.toUpperCase()}\n\nProcesso nº: ${dados.numero_processo}\n\n${dados.perito}, Perito(a) do Juízo, devidamente qualificado(a) nos autos do processo em epígrafe, portador(a) do CPF nº ${dados.cpf} e registro profissional nº ${dados.crea}, com endereço profissional em ${dados.endereco_perito}, vem, respeitosamente, à presença de Vossa Excelência, `

    const footer = `\n\nTermos em que,\nPede deferimento.\n\n${dados.cidade}, ${dados.data_atual}\n\n___________________________________________________\n${dados.perito}\nPerito(a) do Juízo\n${dados.crea}`

    let text = ''
    if (selectedTemplate === 'aceite') {
      text =
        header +
        `informar que ACEITA o encargo para o qual foi nomeado(a), comprometendo-se a cumprir o mister com zelo, dedicação e imparcialidade, entregando o laudo no prazo assinalado por este juízo.` +
        footer
    } else if (selectedTemplate === 'honorarios') {
      text =
        header +
        `apresentar sua proposta de honorários periciais para a realização dos trabalhos técnicos necessários à lide.\n\nApós detida análise dos autos e considerando a complexidade da matéria, o tempo estimado para as diligências, estudos, pesquisas e elaboração do laudo, estima-se o valor dos honorários periciais em ${dados.valor_honorarios} ${dados.valor_extenso}.\n\nRequer, outrossim, a intimação das partes para manifestação acerca da presente proposta e, havendo concordância, que seja determinado o depósito integral do valor para posterior início dos trabalhos.` +
        footer
    } else if (selectedTemplate === 'agendamento') {
      text =
        header +
        `informar que a vistoria técnica necessária para a elaboração do laudo pericial foi agendada para o dia ${dados.data_pericia}, a ser realizada no seguinte local: ${dados.endereco_pericia}.\n\nRequer a intimação das partes e de seus respectivos assistentes técnicos para, querendo, acompanharem os trabalhos.` +
        footer
    } else if (selectedTemplate === 'entrega_laudo') {
      text =
        header +
        `apresentar o LAUDO PERICIAL conclusivo, requerendo a sua juntada aos autos para que produza seus jurídicos e legais efeitos.\n\nRequer ainda a expedição de alvará para levantamento dos honorários periciais previamente depositados em favor deste(a) subscritor(a).` +
        footer
    } else if (selectedTemplate === 'prorrogacao') {
      text =
        header +
        `requerer a PRORROGAÇÃO DO PRAZO para entrega do laudo pericial por mais 30 (trinta) dias, face à complexidade da matéria, à necessidade de diligências complementares e ao grande volume de documentos a serem analisados, o que impossibilita a conclusão dos trabalhos no prazo originalmente assinalado.` +
        footer
    }

    setGeneratedText(text)
  }, [selectedTemplate, pericia, peritoData])

  const handleCopy = () => {
    if (!generatedText) return
    navigator.clipboard.writeText(generatedText)
    toast({ title: 'Sucesso', description: 'Texto copiado para a área de transferência.' })
  }

  const handleDownload = () => {
    if (!generatedText) return
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Peticao_${selectedTemplate}_${pericia.numeroProcesso || 'Sem_Numero'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
          disabled={isLoadingPerito}
        >
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue
              placeholder={
                isLoadingPerito ? 'Carregando dados...' : 'Selecione o modelo de petição...'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!generatedText}
            className="flex-1 sm:flex-none bg-background"
          >
            <Copy className="h-4 w-4 mr-2" /> Copiar
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!generatedText}
            className="flex-1 sm:flex-none bg-background"
          >
            <Download className="h-4 w-4 mr-2" /> Baixar TXT
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 relative">
        {isLoadingPerito && selectedTemplate && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {selectedTemplate ? (
          <Textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            className="min-h-[400px] font-serif text-sm leading-relaxed resize-y bg-background"
            placeholder="O texto gerado aparecerá aqui..."
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
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
