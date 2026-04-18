import { Badge } from '@/components/ui/badge'

export function PaymentBadge({ status }: { status: string }) {
  switch (status?.toLowerCase()) {
    case 'recebido':
    case 'pago':
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Recebido</Badge>
    case 'atrasado':
      return <Badge variant="destructive">Atrasado</Badge>
    case 'recusada':
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
        >
          Recusada
        </Badge>
      )
    case 'pendente':
    default:
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          Pendente
        </Badge>
      )
  }
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Concluído':
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Concluído</Badge>
    case 'Em Andamento':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Em Andamento
        </Badge>
      )
    case 'Pendente':
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          Pendente
        </Badge>
      )
    case 'Recusada':
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
        >
          Recusada
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}
