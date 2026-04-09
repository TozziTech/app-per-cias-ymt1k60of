import { useState, useEffect, useMemo } from 'react'
import { Plus, PhoneCall, CalendarClock, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CaptacaoForm } from '@/components/captacao/CaptacaoForm'
import { CaptacaoList } from '@/components/captacao/CaptacaoList'
import { getCaptacoes, Captacao as ICaptacao } from '@/services/captacao'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Captacao() {
  const [captacoes, setCaptacoes] = useState<ICaptacao[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getCaptacoes()
      setCaptacoes(data)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar captações', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenForm = (id?: string) => {
    setSelectedId(id || null)
    setIsFormOpen(true)
  }

  const stats = useMemo(() => {
    return {
      total: captacoes.length,
      agendados: captacoes.filter((c) => c.status === 'Agendado').length,
      convertidos: captacoes.filter((c) => c.status === 'Convertido').length,
      emAndamento: captacoes.filter((c) => c.status === 'Em Andamento').length,
    }
  }, [captacoes])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Captação de Perícias</h1>
          <p className="text-muted-foreground">
            Gerencie contatos com cartórios e escritórios de advocacia.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <PhoneCall className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retornos Agendados</CardTitle>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agendados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertidos}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48 text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <CaptacaoList captacoes={captacoes} onEdit={handleOpenForm} onRefresh={loadData} />
            )}
          </div>
        </CardContent>
      </Card>

      <CaptacaoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        captacaoId={selectedId}
        onSaved={loadData}
      />
    </div>
  )
}
