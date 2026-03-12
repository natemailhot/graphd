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
