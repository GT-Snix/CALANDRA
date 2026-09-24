import { useState } from 'react'
import { applyTheme, getCurrentTheme, type Theme } from '../lib/theme'
import { MoonIcon, SunIcon } from './icons'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)

  function toggle(): void {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
