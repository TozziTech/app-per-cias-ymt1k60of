import { format } from 'date-fns'

interface IcsEvent {
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate?: Date
  allDay?: boolean
}

export function downloadIcs(event: IcsEvent) {
  const formatDate = (date: Date, allDay = false) => {
    if (allDay) {
      return format(date, 'yyyyMMdd')
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const end =
    event.endDate ||
    (event.allDay
      ? new Date(event.startDate.getTime() + 86400000)
      : new Date(event.startDate.getTime() + 3600000))

  const uid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SysPericias//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}@syspericias.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${formatDate(event.startDate, true)}`
      : `DTSTART:${formatDate(event.startDate)}`,
    event.allDay ? `DTEND;VALUE=DATE:${formatDate(end, true)}` : `DTEND:${formatDate(end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const icsContent = icsLines.filter(Boolean).join('\r\n')
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
