import React, { createContext, useContext, useState, useEffect } from 'react'
import { Pericia } from '@/lib/types'
import { getPericias, createPericia } from '@/services/pericias'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

interface PericiasContextType {
  pericias: Pericia[]
  addPericia: (pericia: Omit<Pericia, 'id'>) => Promise<void>
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
      const created = await createPericia(novaPericia)
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

  return React.createElement(
    PericiasContext.Provider,
    { value: { pericias, addPericia, loading, refresh } },
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
