import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Briefcase, DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default function PeritoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [perito, setPerito] = useState<any>(null)
  const [pericias, setPericias] = useState<any[]>([])
  const [lancamentos, setLancamentos] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [peritoRes, periciasRes, lancamentosRes] = await Promise.all([
        supabase.from('peritos').select('*').eq('id', id).single(),
        supabase.from('pericias').select('*').eq('perito_id', id),
        supabase
          .from('lancamentos')
          .select('*')
          .eq('perito_id', id)
          .order('data', { ascending: false }),
      ])

      if (peritoRes.data) setPerito(peritoRes.data)
      if (periciasRes.data) setPericias(periciasRes.data)
      if (lancamentosRes.data) setLancamentos(lancamentosRes.data)
    }
    if (id) loadData()
  }, [id])

  if (!perito) return <div className="p-8 text-center">Carregando...</div>

  const receitas = lancamentos
    .filter((l) => l.Status === 'receita' || l.tipo === 'receita')
    .reduce((a, c) => a + Number(c.valor), 0)
  const despesas = lancamentos
    .filter((l) => l.Status === 'despesa' || l.tipo === 'despesa')
    .reduce((a, c) => a + Number(c.valor), 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/peritos')}
        className="pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Peritos
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{perito.nome}</h1>
          <p className="text-muted-foreground">
            {perito.especialidade || 'Sem especialidade informada'}
          </p>
        </div>
        <Badge
          variant={perito.status === 'Ativo' ? 'default' : 'secondary'}
          className="text-sm px-4 py-1"
        >
          {perito.status === 'Ativo' ? 'Em Execução' : perito.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">R$ {receitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" /> Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">R$ {despesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Perícias Associadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{pericias.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Lista de Perícias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pericias.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma perícia associada.</p>
            ) : (
              pericias.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/20"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {p.numero_processo || p.codigo_interno || 'Sem número'}
                    </p>
                    <p className="text-xs text-muted-foreground">Vara: {p.vara}</p>
                  </div>
                  <Badge variant="outline">{p.status || 'Pendente'}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Histórico Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lancamentos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum lançamento.</p>
            ) : (
              lancamentos.map((l) => (
                <div
                  key={l.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-border bg-secondary/20"
                >
                  <div>
                    <p className="font-medium text-sm">{l.descricao}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {format(new Date(l.data), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${l.Status === 'receita' || l.tipo === 'receita' ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {l.Status === 'receita' || l.tipo === 'receita' ? '+' : '-'} R${' '}
                    {Number(l.valor).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
