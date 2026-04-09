import { supabase } from '@/lib/supabase/client'

export interface AuditFilter {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
}

export const getAuditLogs = async (filters: AuditFilter) => {
  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id (name, email)
    `)
    .order('created_at', { ascending: false })

  if (filters.startDate) {
    query = query.gte('created_at', `${filters.startDate}T00:00:00Z`)
  }
  if (filters.endDate) {
    query = query.lte('created_at', `${filters.endDate}T23:59:59Z`)
  }
  if (filters.userId && filters.userId !== 'all') {
    query = query.eq('user_id', filters.userId)
  }
  if (filters.action && filters.action !== 'all') {
    query = query.eq('action', filters.action)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getAuditUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('id, name, email').order('name')

  if (error) throw error
  return data
}
