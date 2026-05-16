import { useLayoutEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function applyDarkClass(isDark: boolean): void {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const [theme, setTheme] = useState<Theme>(readStoredTheme)

  useLayoutEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }

    if (theme === 'light') {
      applyDarkClass(false)
      return
    }

    if (theme === 'dark') {
      applyDarkClass(true)
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    applyDarkClass(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      applyDarkClass(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return { theme, setTheme }
}
