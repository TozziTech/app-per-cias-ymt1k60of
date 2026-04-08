import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function TarefaRelatorio({ tarefaId }: { tarefaId: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGeneratePDF = async () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description:
          'O bloqueador de pop-ups impediu a abertura do relatório. Permita pop-ups para este site.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      printWindow.document.write(
        '<html><head><title>Carregando...</title></head><body style="font-family:sans-serif;color:#666;text-align:center;margin-top:50px;"><h2>Gerando relatório, aguarde...</h2></body></html>',
      )

      const { data: tarefa, error: tErr } = await supabase
        .from('tarefas')
        .select(`
          *,
          pericia:pericias(*),
          responsavel:responsavel_id(name),
          perito_associado:perito_associado_id(name)
        `)
        .eq('id', tarefaId)
        .single()

      if (tErr || !tarefa) throw new Error('Erro ao carregar dados da tarefa')

      let lancamentos: any[] = []
      if (tarefa.pericia_id) {
        const { data: l, error: lErr } = await supabase
          .from('lancamentos')
          .select('*')
          .eq('pericia_id', tarefa.pericia_id)
          .order('data', { ascending: false })
        if (!lErr && l) lancamentos = l
      }

      const formatCurrency = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
      const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório da Tarefa - ${tarefa.titulo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 900px; margin: 0 auto; }
            h1 { color: #1a56db; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 30px; }
            h2 { color: #374151; margin-top: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .section { margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .card h3 { margin-top: 0; color: #111827; font-size: 16px; margin-bottom: 15px; }
            .card p { margin: 8px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background: #f3f4f6; color: #374151; font-weight: 600; }
            .receita { color: #059669; font-weight: 500; }
            .despesa { color: #dc2626; font-weight: 500; }
            .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .card { border: 1px solid #d1d5db; break-inside: avoid; }
              table { break-inside: auto; }
              tr { break-inside: avoid; break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Tarefa</h1>
          
          <div class="grid section">
            <div class="card">
              <h3>Detalhes da Tarefa</h3>
              <p><strong>Título:</strong> ${tarefa.titulo}</p>
              <p><strong>Status:</strong> ${tarefa.status}</p>
              <p><strong>Data Entrega:</strong> ${tarefa.data_entrega ? formatDate(tarefa.data_entrega) : 'Não definida'}</p>
              <p><strong>Responsável:</strong> ${(tarefa.responsavel as any)?.name || 'Não definido'}</p>
              <p><strong>Perito Associado:</strong> ${(tarefa.perito_associado as any)?.name || 'Não definido'}</p>
              <p><strong>Descrição:</strong> ${tarefa.descricao || 'Sem descrição'}</p>
            </div>
            
            ${
              tarefa.pericia
                ? `
            <div class="card">
              <h3>Processo Vinculado</h3>
              <p><strong>Nº Processo:</strong> ${(tarefa.pericia as any).numero_processo || 'N/A'}</p>
              <p><strong>Vara:</strong> ${(tarefa.pericia as any).vara || 'N/A'}</p>
              <p><strong>Honorários:</strong> ${(tarefa.pericia as any).honorarios ? formatCurrency((tarefa.pericia as any).honorarios) : 'N/A'}</p>
              <p><strong>Status Processo:</strong> ${(tarefa.pericia as any).status || 'N/A'}</p>
              <p><strong>Status Pagamento:</strong> ${(tarefa.pericia as any).status_pagamento || 'N/A'}</p>
            </div>
            `
                : '<div class="card"><p>Tarefa avulsa (sem processo vinculado)</p></div>'
            }
          </div>

          ${
            tarefa.pericia
              ? `
          <div class="section">
            <h2>Extrato Financeiro do Processo</h2>
            ${
              lancamentos.length > 0
                ? `
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${lancamentos
                  .map(
                    (l) => `
                  <tr>
                    <td>${formatDate(l.data)}</td>
                    <td>${l.descricao}</td>
                    <td>${l.categoria}</td>
                    <td>${l.status}</td>
                    <td class="${l.tipo === 'receita' ? 'receita' : 'despesa'}">
                      ${l.tipo === 'receita' ? '+' : '-'}${formatCurrency(l.valor)}
                    </td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
            `
                : '<p style="color: #6b7280; font-style: italic;">Nenhum lançamento financeiro encontrado para este processo.</p>'
            }
          </div>
          `
              : ''
          }

          <div class="footer">
            Gerado em ${new Date().toLocaleString('pt-BR')} - App Perícias
          </div>
        </body>
        </html>
      `

      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
      }, 500)

      toast({ title: 'Relatório gerado com sucesso!' })
    } catch (error: any) {
      printWindow.close()
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center space-y-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Relatório da Tarefa
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-2 mx-auto">
          Gere um documento formatado contendo os detalhes desta tarefa, informações completas do
          processo vinculado e o extrato financeiro.
        </p>
      </div>
      <Button
        onClick={handleGeneratePDF}
        disabled={loading}
        size="lg"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Download className="mr-2 h-5 w-5" />
        )}
        {loading ? 'Gerando...' : 'Exportar para PDF / Imprimir'}
      </Button>
    </div>
  )
}
