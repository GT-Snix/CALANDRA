import { addDays, toDateKey } from './date'

export const NIGHT_START_MINUTES = 22 * 60 + 47 // 22:47
export const NIGHT_END_MINUTES = 5 * 60 + 59 // 05:59

export interface OverlayModeResult {
  mode: 'day' | 'night'
  // Day mode: the date whose tasks to show.
  targetDate?: string
  // Night mode: the day being resolved via rollover.
  endingDay?: string
  // Night mode: the day being planned.
  planningDay?: string
}

// Night spans midnight (22:47 through 05:59 inclusive), so "isNight" alone
// isn't enough to know which calendar day is "ending" vs "being planned" —
// after midnight but before 06:00, the session is still resolving
// YESTERDAY's leftovers and planning TODAY, not the other way around.
export function getOverlayMode(now: Date): OverlayModeResult {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const isNight = nowMinutes >= NIGHT_START_MINUTES || nowMinutes <= NIGHT_END_MINUTES

  if (!isNight) {
    return { mode: 'day', targetDate: toDateKey(now) }
  }

  if (nowMinutes <= NIGHT_END_MINUTES) {
    // After midnight, still within last night's session.
    return {
      mode: 'night',
      endingDay: toDateKey(addDays(now, -1)),
      planningDay: toDateKey(now)
    }
  }

  // 22:47–23:59, before midnight.
  return {
    mode: 'night',
    endingDay: toDateKey(now),
    planningDay: toDateKey(addDays(now, 1))
  }
}
