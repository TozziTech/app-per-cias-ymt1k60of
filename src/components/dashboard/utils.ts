import { useMemo } from 'react'

export const parseDateSafe = (d: string | Date | undefined | null): Date | null => {
  if (!d) return null
  const parsed = new Date(d)
  if (isNaN(parsed.getTime())) return null
  return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000)
}

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export const getKey = (date: Date | null) => {
  if (!date) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const usePeriodsConfig = (dashboardPeriod: '6m' | '12m' | 'ytd') => {
  return useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]

    let periodMonths = 12
    let startYear = currentYear
    let startMonth = currentMonth

    if (dashboardPeriod === '6m') {
      periodMonths = 6
      startMonth = currentMonth - 5
    } else if (dashboardPeriod === '12m') {
      periodMonths = 12
      startMonth = currentMonth - 11
    } else if (dashboardPeriod === 'ytd') {
      periodMonths = currentMonth + 1
      startMonth = 0
    }

    return Array.from({ length: periodMonths }).map((_, i) => {
      const d = new Date(currentYear, startMonth + i, 1)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      }
    })
  }, [dashboardPeriod])
}
