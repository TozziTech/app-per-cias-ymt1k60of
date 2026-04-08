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
import { Copy, Download, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

export function GeradorPeticoes({ pericia }: GeradorPeticoesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (!selectedTemplate) {
      setGeneratedText('')
      return
    }

    const dados = {
      vara: pericia.vara || '[VARA]',
      cidade: pericia.cidade || '[CIDADE]',
      numero_processo: pericia.numeroProcesso || '[NÚMERO DO PROCESSO]',
      juiz: pericia.juiz || '[JUIZ]',
      perito: pericia.peritoAssociado || '[NOME DO PERITO]',
      valor_honorarios: pericia.honorarios ? `R$ ${pericia.honorarios.toFixed(2)}` : '[VALOR]',
      data_pericia: pericia.dataPericia
        ? new Date(pericia.dataPericia).toLocaleDateString('pt-BR')
        : '[DATA DA PERÍCIA]',
      endereco: pericia.endereco || '[ENDEREÇO]',
      data_atual: new Date().toLocaleDateString('pt-BR'),
    }

    let text = ''
    const header = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ${dados.vara} DA COMARCA DE ${dados.cidade}\n\nProcesso nº: ${dados.numero_processo}\n\n${dados.perito}, perito nomeado nos autos do processo em epígrafe, vem, respeitosamente, à presença de Vossa Excelência, `
    const footer = `\n\nTermos em que,\nPede deferimento.\n\n${dados.cidade}, ${dados.data_atual}\n\n${dados.perito}\nPerito do Juízo`

    if (selectedTemplate === 'aceite') {
      text =
        header +
        `informar que ACEITA o encargo para o qual foi nomeado, comprometendo-se a cumprir o mister com zelo e dedicação.` +
        footer
    } else if (selectedTemplate === 'honorarios') {
      text =
        header +
        `apresentar sua proposta de honorários periciais no valor de ${dados.valor_honorarios}.\n\nRequer, outrossim, a intimação das partes para manifestação.` +
        footer
    } else if (selectedTemplate === 'agendamento') {
      text =
        header +
        `informar que a vistoria técnica foi agendada para o dia ${dados.data_pericia}, no endereço: ${dados.endereco}.\n\nRequer a intimação das partes e de seus respectivos assistentes técnicos para, querendo, acompanharem os trabalhos.` +
        footer
    } else if (selectedTemplate === 'entrega_laudo') {
      text =
        header +
        `apresentar o LAUDO PERICIAL conclusivo, requerendo a sua juntada aos autos para os devidos fins de direito.\n\nRequer ainda a expedição de alvará para levantamento dos honorários periciais depositados.` +
        footer
    } else if (selectedTemplate === 'prorrogacao') {
      text =
        header +
        `requerer a PRORROGAÇÃO DO PRAZO para entrega do laudo pericial por mais 30 (trinta) dias, face à complexidade da matéria e à necessidade de diligências complementares.` +
        footer
    }

    setGeneratedText(text)
  }, [selectedTemplate, pericia])

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
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Selecione o modelo de petição..." />
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

      <div className="rounded-md border bg-muted/30 p-4">
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
              Selecione um modelo acima para gerar a petição automaticamente com os dados deste
              processo.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
