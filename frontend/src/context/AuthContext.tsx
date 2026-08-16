import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'

const API = '/api/v1'
const TOKEN_KEY = 'auth_token'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  github_id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  company: string | null
  role: string
  is_active: boolean
  created_at: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  setTokenAndFetchUser: (token: string) => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setTokenAndFetchUser: async () => {},
})

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY))

  const fetchMe = useCallback(async (jwt: string): Promise<AuthUser | null> => {
    try {
      const r = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!r.ok) return null
      return await r.json()
    } catch {
      return null
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) { setIsLoading(false); return }
    fetchMe(stored).then(u => {
      if (u) {
        setUser(u)
        setToken(stored)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      }
      setIsLoading(false)
    })
  }, [fetchMe])

  const login = useCallback(async () => {
    try {
      const r = await fetch(`${API}/auth/github/authorize`)
      if (!r.ok) throw new Error('authorize failed')
      const { redirect_url } = await r.json()
      window.location.href = redirect_url
    } catch (e) {
      console.error('GitHub OAuth redirect failed', e)
    }
  }, [])

  const logout = useCallback(async () => {
    const jwt = localStorage.getItem(TOKEN_KEY)
    if (jwt) {
      try {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt}` },
        })
      } catch { /* ignore */ }
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const setTokenAndFetchUser = useCallback(async (jwt: string) => {
    localStorage.setItem(TOKEN_KEY, jwt)
    setToken(jwt)
    setIsLoading(true)
    const u = await fetchMe(jwt)
    if (u) {
      setUser(u)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }
    setIsLoading(false)
  }, [fetchMe])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      setTokenAndFetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
