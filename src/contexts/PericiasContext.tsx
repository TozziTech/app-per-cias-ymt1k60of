import React, { createContext, useContext, useState } from 'react'
import { Pericia } from '@/lib/types'

const MOCK_PERICIAS: Pericia[] = [
  {
    id: 'PER-2023-001',
    titulo: 'Vistoria Estrutural - Edifício A',
    descricao: 'Análise de fissuras e recalque na fundação do bloco principal.',
    dataSolicitacao: '2023-10-01',
    dataLimite: '2023-10-15',
    responsavel: 'Eng. Carlos Andrade',
    status: 'Concluído',
  },
  {
    id: 'PER-2023-002',
    titulo: 'Análise de Infiltração - Condomínio B',
    descricao: 'Mapeamento de umidade na fachada sul.',
    dataSolicitacao: '2023-10-05',
    dataLimite: '2023-10-20',
    responsavel: 'Eng. Ana Silva',
    status: 'Em Andamento',
  },
  {
    id: 'PER-2023-003',
    titulo: 'Laudo Cautelar - Obra Vizinha',
    descricao: 'Vistoria prévia dos imóveis lindeiros à nova construção.',
    dataSolicitacao: '2023-10-10',
    dataLimite: '2023-10-12',
    responsavel: 'Eng. Carlos Andrade',
    status: 'Pendente',
  },
  {
    id: 'PER-2023-004',
    titulo: 'Avaliação de Sinistro - Galpão Logístico',
    descricao: 'Verificação de danos estruturais após incêndio no setor B.',
    dataSolicitacao: '2023-10-12',
    dataLimite: '2023-10-30',
    responsavel: 'Eng. Roberto Mendes',
    status: 'Em Andamento',
  },
]

interface PericiasContextType {
  pericias: Pericia[]
  addPericia: (pericia: Omit<Pericia, 'id' | 'status'>) => void
}

const PericiasContext = createContext<PericiasContextType | undefined>(undefined)

export function PericiasProvider({ children }: { children: React.ReactNode }) {
  const [pericias, setPericias] = useState<Pericia[]>(MOCK_PERICIAS)

  const addPericia = (novaPericia: Omit<Pericia, 'id' | 'status'>) => {
    const id = `PER-${new Date().getFullYear()}-${String(pericias.length + 1).padStart(3, '0')}`
    setPericias((prev) => [{ ...novaPericia, id, status: 'Pendente' }, ...prev])
  }

  return React.createElement(
    PericiasContext.Provider,
    { value: { pericias, addPericia } },
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
