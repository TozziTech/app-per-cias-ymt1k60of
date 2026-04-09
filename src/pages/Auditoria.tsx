import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Download, RefreshCw, Search } from 'lucide-react'
import { getAuditLogs, getAuditUsers, AuditFilter } from '@/services/auditoria'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Auditoria() {
  const { toast } = useToast()
  const [dbLogs, setDbLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AuditFilter>({
    startDate: '',
    endDate: '',
    userId: 'all',
    action: 'all',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [logsData, usersData] = await Promise.all([
        getAuditLogs(filters),
        users.length === 0 ? getAuditUsers() : Promise.resolve(users),
      ])
      setDbLogs(logsData || [])
      if (users.length === 0) setUsers(usersData || [])
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filters, users, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const result = dbLogs.filter((log) => {
      if (!search) return true
      const term = search.toLowerCase()
      const entity = log.entity_type?.toLowerCase() || ''
      const details = log.details ? JSON.stringify(log.details).toLowerCase() : ''
      return entity.includes(term) || details.includes(term)
    })
    setFilteredLogs(result)
  }, [dbLogs, search])

  const handleExport = () => {
    const csv = [
      ['Data', 'Usuário', 'Ação', 'Entidade', 'Detalhes'].join(';'),
      ...filteredLogs.map((l) =>
        [
          format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
          (l.profiles as any)?.name || 'Sistema',
          l.action,
          l.entity_type,
          JSON.stringify(l.details || {}).replace(/"/g, '""'),
        ]
          .map((s) => `"${s}"`)
          .join(';'),
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `auditoria-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`
    link.click()
  }

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'criou':
        return <Badge className="bg-emerald-500/10 text-emerald-500">{action}</Badge>
      case 'atualizou':
        return <Badge className="bg-blue-500/10 text-blue-500">{action}</Badge>
      case 'excluiu':
        return <Badge className="bg-red-500/10 text-red-500">{action}</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Auditoria Global</h2>
          <p className="text-muted-foreground">
            Monitore todas as atividades e alterações do sistema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleExport} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
          <CardDescription>Refine a visualização dos logs do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select
                value={filters.userId}
                onValueChange={(v) => setFilters({ ...filters, userId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select
                value={filters.action}
                onValueChange={(v) => setFilters({ ...filters, action: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="criou">Criou</SelectItem>
                  <SelectItem value="atualizou">Atualizou</SelectItem>
                  <SelectItem value="excluiu">Excluiu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Busca Livre</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Processo, entidade..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Carregando logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado para os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{(log.profiles as any)?.name || 'Sistema'}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="capitalize">{log.entity_type}</TableCell>
                      <TableCell
                        className="max-w-[300px] truncate text-muted-foreground"
                        title={JSON.stringify(log.details)}
                      >
                        {log.details
                          ? Object.entries(log.details)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' | ')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
