import React, { createContext, useContext, useState, useEffect } from 'react'
import { Pericia } from '@/lib/types'
import {
  getPericias,
  createPericia,
  updatePericia as updatePericiaService,
} from '@/services/pericias'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

import { deletePericia as deletePericiaService } from '@/services/pericias'

interface PericiasContextType {
  pericias: Pericia[]
  addPericia: (pericia: Omit<Pericia, 'id'>) => Promise<void>
  updatePericia: (id: string, pericia: Partial<Pericia>) => Promise<void>
  deletePericia: (id: string) => Promise<void>
  loading: boolean
  refresh: () => Promise<void>
}

const PericiasContext = createContext<PericiasContextType | undefined>(undefined)

export function PericiasProvider({ children }: { children: React.ReactNode }) {
  const [pericias, setPericias] = useState<Pericia[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const refresh = async () => {
    try {
      setLoading(true)
      const data = await getPericias()
      setPericias(data)
    } catch (error) {
      console.error('Failed to fetch pericias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })

    refresh()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addPericia = async (novaPericia: Omit<Pericia, 'id'>) => {
    try {
      const defaultPeticoes = [
        { id: crypto.randomUUID(), texto: 'Petição Pedido de Honorários', concluido: false },
        { id: crypto.randomUUID(), texto: 'Petição de Aceite', concluido: false },
        { id: crypto.randomUUID(), texto: 'Petição de Agendamento da Perícia', concluido: false },
        { id: crypto.randomUUID(), texto: 'Petição Pedido de Documentação', concluido: false },
        { id: crypto.randomUUID(), texto: 'Petição de Prorrogação de Prazo', concluido: false },
      ]

      const periciaToCreate = {
        ...novaPericia,
        peticoes:
          !novaPericia.peticoes || novaPericia.peticoes.length === 0
            ? defaultPeticoes
            : novaPericia.peticoes,
      }

      const created = await createPericia(periciaToCreate)
      setPericias((prev) => [created, ...prev])
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar perícia',
        variant: 'destructive',
      })
      throw new Error(error.message || 'Erro ao criar perícia')
    }
  }

  const deletePericia = async (id: string) => {
    try {
      await deletePericiaService(id)
      setPericias((prev) => prev.filter((p) => p.id !== id))
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir perícia',
        variant: 'destructive',
      })
      throw new Error(error.message || 'Erro ao excluir perícia')
    }
  }

  const updatePericia = async (id: string, dados: Partial<Pericia>) => {
    try {
      const updated = await updatePericiaService(id, dados)
      setPericias((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perícia',
        variant: 'destructive',
      })
      throw new Error(error.message || 'Erro ao atualizar perícia')
    }
  }

  return React.createElement(
    PericiasContext.Provider,
    { value: { pericias, addPericia, updatePericia, deletePericia, loading, refresh } },
    children,
  )
}

export function usePericias() {
  const context = useContext(PericiasContext)
  if (context === undefined) {
    throw new Error('usePericias must be used within a PericiasProvider')
  }
  return context
}
