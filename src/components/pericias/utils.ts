import { Pericia } from '@/lib/types'
import { differenceInCalendarDays } from 'date-fns'

export const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
  if (!d) return null
  const parsed = new Date(d)
  if (isNaN(parsed.getTime())) return null
  return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
}

export const renderDate = (d?: string | Date | null) => {
  if (!d) return '-'
  const parsed = parseDateSafe(d)
  return parsed ? parsed.toLocaleDateString('pt-BR') : '-'
}

export const isParada = (p: Pericia) => {
  if (p.status === 'Concluído' || p.status === 'Recusada') return false
  const updatedAt = parseDateSafe(p.updated_at)
  if (!updatedAt) return false
  return differenceInCalendarDays(new Date(), updatedAt) > 30
}

export const getPrazoStatus = (p: Pericia) => {
  if (p.status === 'Concluído') return null
  const prazoStr =
    p.prazoEntrega ||
    (p as any).prazo_entrega ||
    p.dataEntregaLaudo ||
    (p as any).data_entrega_laudo
  if (!prazoStr) return null

  const prazo = parseDateSafe(prazoStr)
  if (!prazo) return null

  const diff = differenceInCalendarDays(prazo, new Date())
  if (diff < 0) return { status: 'atrasado', dias: Math.abs(diff) }
  if (diff <= 7) return { status: 'proximo', dias: diff }
  return null
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
