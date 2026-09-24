export type Theme = 'light' | 'dark'

// Keep in sync with the inline theme-init script in src/renderer/index.html,
// which reads this same key before React mounts to avoid a flash of the
// wrong theme.
export const THEME_STORAGE_KEY = 'daylog:theme'

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function getCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return getStoredTheme() ?? 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (e.g. disabled) — theme still applies for this
    // session, it just won't persist.
  }
}
