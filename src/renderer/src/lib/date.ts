export function todayKey(): string {
  return toDateKey(new Date())
}

export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Parses a 'YYYY-MM-DD' key as a local-time Date. Deliberately not
// `new Date(dateKey)`, which parses as UTC midnight and can shift a day
// depending on the local timezone offset.
export function parseLocalDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDisplayDate(dateKey: string): string {
  return parseLocalDate(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

// Compact form for the small overlay window, e.g. "Thu, Sep 24".
export function formatCompactDate(dateKey: string): string {
  return parseLocalDate(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
