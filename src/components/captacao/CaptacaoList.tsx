import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Captacao, deleteCaptacao } from '@/services/captacao'
import { useToast } from '@/hooks/use-toast'

interface CaptacaoListProps {
  captacoes: Captacao[]
  onEdit: (id: string) => void
  onRefresh: () => void
}

export function CaptacaoList({ captacoes, onEdit, onRefresh }: CaptacaoListProps) {
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return
    try {
      await deleteCaptacao(id)
      toast({ title: 'Sucesso', description: 'Registro excluído.' })
      onRefresh()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Convertido':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'Agendado':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'Em Andamento':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'Recusado':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data Contato</TableHead>
          <TableHead>Instituição / Cartório</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>Perito Associado</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Retorno Agendado</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {captacoes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        ) : (
          captacoes.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {format(new Date(item.data_contato), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">{item.instituicao}</TableCell>
              <TableCell>
                {item.nome_contato}
                {item.telefone && (
                  <div className="text-xs text-muted-foreground">{item.telefone}</div>
                )}
              </TableCell>
              <TableCell>{item.perito?.nome || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                {item.data_retorno
                  ? format(new Date(item.data_retorno), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
