import pb from '@/lib/pocketbase/client'

export interface AuditFilter {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
}

export const getAuditLogs = async (filters: AuditFilter) => {
  let filter = []
  if (filters.startDate) filter.push(`created >= '${filters.startDate} 00:00:00'`)
  if (filters.endDate) filter.push(`created <= '${filters.endDate} 23:59:59'`)
  if (filters.userId && filters.userId !== 'all') filter.push(`user_id = '${filters.userId}'`)
  if (filters.action && filters.action !== 'all') filter.push(`action = '${filters.action}'`)

  const records = await pb.collection('activity_logs').getFullList({
    filter: filter.join(' && '),
    sort: '-created',
    expand: 'user_id',
  })

  return records.map((r) => ({
    ...r,
    profiles: r.expand?.user_id
      ? { name: r.expand.user_id.name, email: r.expand.user_id.email }
      : null,
  }))
}

export const getAuditUsers = async () => {
  const records = await pb.collection('users').getFullList({
    sort: 'name',
  })
  return records.map((r) => ({ id: r.id, name: r.name, email: r.email }))
}
