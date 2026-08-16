import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

export function AuthCallback() {
  const [params] = useSearchParams()
  const { setTokenAndFetchUser } = useAuth()
  const navigate = useNavigate()
  const ran = useRef(false)

  useEffect(() => {
    // StrictMode fires effects twice in dev; guard with a ref
    if (ran.current) return
    ran.current = true

    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (error) {
      console.error('GitHub OAuth error:', error)
      navigate('/?auth=error', { replace: true })
      return
    }
    if (!code) {
      navigate('/?auth=missing_code', { replace: true })
      return
    }

    const query = new URLSearchParams()
    query.set('code', code)
    if (state) query.set('state', state)

    fetch(`${API}/auth/callback?${query.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`callback HTTP ${r.status}`)
        return r.json()
      })
      .then(async data => {
        const token = data.access_token ?? data.token
        if (!token) throw new Error('No token in response')
        await setTokenAndFetchUser(token)
        navigate('/profile', { replace: true })
      })
      .catch(err => {
        console.error('Auth callback failed:', err)
        navigate('/?auth=error', { replace: true })
      })
  }, [params, navigate, setTokenAndFetchUser])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid var(--accent)',
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600 }}>
        Авторизация через GitHub…
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
        Пожалуйста, подождите
      </p>
    </div>
  )
}
