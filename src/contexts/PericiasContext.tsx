import React, { createContext, useContext, useState } from 'react'
import { Pericia } from '@/lib/types'

const MOCK_PERICIAS: Pericia[] = [
  {
    id: 'PER-2023-001',
    codigoInterno: 'INT-001',
    numeroProcesso: '0001234-56.2023.8.26.0001',
    juiz: 'Dr. Roberto Alves',
    vara: 'Cível',
    cidade: 'São Paulo',
    dataNomeacao: '2023-10-01',
    dataPericia: '2023-10-10',
    dataEntregaLaudo: '2023-10-25',
    honorarios: 5000,
    endereco: 'Rua Exemplo, 123',
    observacoes: 'Vistoria Estrutural - Edifício A. Análise de fissuras.',
    linkNuvem: 'https://drive.google.com/drive/folders/1',
    checklist: [
      { id: '1', texto: 'Ler processo', concluido: true },
      { id: '2', texto: 'Agendar vistoria', concluido: true },
    ],
    status: 'Concluído',
  },
  {
    id: 'PER-2023-002',
    codigoInterno: 'INT-002',
    numeroProcesso: '0009876-54.2023.8.26.0002',
    juiz: 'Dra. Maria Clara',
    vara: 'Cível',
    cidade: 'Campinas',
    dataNomeacao: '2023-10-05',
    dataPericia: '2023-10-15',
    dataEntregaLaudo: '2023-10-30',
    honorarios: 7500,
    endereco: 'Av. Teste, 987',
    observacoes: 'Análise de Infiltração - Condomínio B.',
    linkNuvem: 'https://1drv.ms/f/s!Example2',
    checklist: [{ id: '1', texto: 'Solicitar documentos', concluido: false }],
    status: 'Em Andamento',
  },
]

interface PericiasContextType {
  pericias: Pericia[]
  addPericia: (pericia: Omit<Pericia, 'id'>) => void
}

const PericiasContext = createContext<PericiasContextType | undefined>(undefined)

export function PericiasProvider({ children }: { children: React.ReactNode }) {
  const [pericias, setPericias] = useState<Pericia[]>(MOCK_PERICIAS)

  const addPericia = (novaPericia: Omit<Pericia, 'id'>) => {
    const id = `PER-${new Date().getFullYear()}-${String(pericias.length + 1).padStart(3, '0')}`
    setPericias((prev) => [{ ...novaPericia, id } as Pericia, ...prev])
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
