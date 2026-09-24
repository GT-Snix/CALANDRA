// The overlay's day/night mode depends on wall-clock time, which is awkward
// to test by waiting for the real clock to cross 22:47. In dev builds only,
// exposes a way to override "now" from devtools so mode-switching can be
// verified without waiting. Stripped from production builds.
let mockNow: Date | null = null

export function getNow(): Date {
  return mockNow ? new Date(mockNow) : new Date()
}

if (import.meta.env.DEV) {
  ;(window as unknown as { __daylogSetMockNow?: (iso: string | null) => void }).__daylogSetMockNow = (
    iso
  ) => {
    mockNow = iso ? new Date(iso) : null
  }
}
