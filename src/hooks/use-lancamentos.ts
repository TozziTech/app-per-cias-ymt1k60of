import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Lancamento } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function useLancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLancamentos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('lancamentos')
        .select(`
          *,
          pericia:pericias(id, numero_processo, vara)
        `)
        .order('data', { ascending: false })

      if (error) throw error

      setLancamentos(data as any)
    } catch (error: any) {
      toast({
        title: 'Erro ao buscar lançamentos',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLancamentos()
  }, [fetchLancamentos])

  const addLancamento = async (lancamento: Partial<Lancamento>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('lancamentos')
        .insert(lancamento)
        .select(`
          *,
          pericia:pericias(id, numero_processo, vara)
        `)
        .single()

      if (error) throw error

      setLancamentos([data as any, ...lancamentos])
      toast({ title: 'Lançamento salvo com sucesso' })
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
      return { data: null, error }
    }
  }

  const updateLancamento = async (id: string, updates: Partial<Lancamento>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('lancamentos')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          pericia:pericias(id, numero_processo, vara)
        `)
        .single()

      if (error) throw error

      setLancamentos(lancamentos.map((l) => (l.id === id ? (data as any) : l)))
      toast({ title: 'Lançamento atualizado' })
      return { data, error: null }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
      return { data: null, error }
    }
  }

  const deleteLancamento = async (id: string) => {
    try {
      const { error } = await (supabase as any).from('lancamentos').delete().eq('id', id)
      if (error) throw error

      setLancamentos(lancamentos.filter((l) => l.id !== id))
      toast({ title: 'Lançamento excluído' })
      return { error: null }
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      })
      return { error }
    }
  }

  return {
    lancamentos,
    loading,
    fetchLancamentos,
    addLancamento,
    updateLancamento,
    deleteLancamento,
  }
}
