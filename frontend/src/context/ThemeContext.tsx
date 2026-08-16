import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'hacker' | 'steampunk'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) ?? 'dark'
  })

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

// ── Theme metadata ──────────────────────────────────────────
export const THEMES: Array<{ id: Theme; label: string; icon: string; desc: string }> = [
  { id: 'dark',      label: 'Dark',      icon: '◑', desc: 'Тёмная, классическая' },
  { id: 'light',     label: 'Light',     icon: '○', desc: 'Светлая, высокий контраст' },
  { id: 'hacker',    label: 'Hacker',    icon: '█', desc: 'Зелёный терминал' },
  { id: 'steampunk', label: 'Steampunk', icon: '⚙', desc: 'Медь и латунь' },
]
