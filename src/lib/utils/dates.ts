export function getTodayUTC(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayUTC()
}

export function getYesterdayUTC(): string {
  const today = new Date(getTodayUTC() + 'T00:00:00Z')
  today.setUTCDate(today.getUTCDate() - 1)
  return today.toISOString().slice(0, 10)
}

export function getTomorrowUTC(): string {
  const today = new Date(getTodayUTC() + 'T00:00:00Z')
  today.setUTCDate(today.getUTCDate() + 1)
  return today.toISOString().slice(0, 10)
}
