import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Search, Download } from 'lucide-react'
import { Lancamento } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LancamentosTableProps {
  lancamentos: Lancamento[]
  isLoading: boolean
  onEdit: (l: Lancamento) => void
  onDelete: (id: string) => void
}

export function LancamentosTable({
  lancamentos,
  isLoading,
  onEdit,
  onDelete,
}: LancamentosTableProps) {
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [filterMonth, setFilterMonth] = useState<string>('todos')
  const [search, setSearch] = useState('')

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const months = useMemo(() => {
    const map = new Map<string, string>()
    lancamentos.forEach((l) => {
      const d = new Date(l.data)
      if (!isNaN(d.getTime())) {
        const key = format(d, 'yyyy-MM')
        const label = format(d, 'MMMM yyyy', { locale: ptBR })
        map.set(key, label.charAt(0).toUpperCase() + label.slice(1))
      }
    })
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [lancamentos])

  const filtered = useMemo(() => {
    return lancamentos.filter((l) => {
      if (filterTipo !== 'todos' && l.tipo !== filterTipo) return false

      if (filterMonth !== 'todos') {
        const d = new Date(l.data)
        if (isNaN(d.getTime()) || format(d, 'yyyy-MM') !== filterMonth) return false
      }

      if (search) {
        const term = search.toLowerCase()
        if (
          !l.descricao.toLowerCase().includes(term) &&
          !l.categoria.toLowerCase().includes(term) &&
          !(l.pericia?.numero_processo || '').toLowerCase().includes(term)
        ) {
          return false
        }
      }

      return true
    })
  }, [lancamentos, filterTipo, filterMonth, search])

  const handleExportCSV = () => {
    if (!filtered.length) return

    const headers = [
      'Data',
      'Tipo',
      'Categoria',
      'Descrição',
      'Valor',
      'Status',
      'Processo (Perícia)',
    ]
    const csvContent = [
      headers.join(';'),
      ...filtered.map((l) => {
        const date = format(new Date(l.data), 'dd/MM/yyyy')
        const tipo = l.tipo
        const categoria = l.categoria
        const descricao = `"${l.descricao.replace(/"/g, '""')}"`
        const valor = l.valor.toString().replace('.', ',')
        const status = l.status
        const processo = l.pericia?.numero_processo ? `"${l.pericia.numero_processo}"` : ''
        return [date, tipo, categoria, descricao, valor, status, processo].join(';')
      }),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `lancamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4">
        <CardTitle>Histórico de Movimentações</CardTitle>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-full sm:w-[180px]"
            />
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {months.map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 w-full sm:w-auto"
            title="Exportar para CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição/Perícia</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    Carregando lançamentos...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    Nenhum lançamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(l.data), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {l.tipo === 'receita' ? (
                        <div className="flex items-center text-emerald-600 font-medium text-sm">
                          <ArrowUpCircle className="mr-1 h-4 w-4" /> Receita
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-600 font-medium text-sm">
                          <ArrowDownCircle className="mr-1 h-4 w-4" /> Despesa
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[200px]">{l.descricao}</div>
                      {l.pericia && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          Proc: {l.pericia.numero_processo}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{l.categoria}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-normal capitalize',
                          l.status === 'recebido'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : l.status === 'pago'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200',
                        )}
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium whitespace-nowrap',
                        l.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {l.tipo === 'receita' ? '+' : '-'}
                      {formatCurrency(l.valor)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(l)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir?')) onDelete(l.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
