import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      // Small delay so page loads first
      setTimeout(() => setIsVisible(true), 1200)
    }
  }, [])

  const accept = (all: boolean) => {
    localStorage.setItem('cookieConsent', JSON.stringify({ necessary: true, analytics: all }))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 48px)', maxWidth: 600,
      background: 'rgba(8,12,20,.97)',
      border: '1px solid rgba(34,211,238,.2)',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 0 40px rgba(0,0,0,.6), 0 0 0 1px rgba(34,211,238,.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      animation: 'fadeUp .4s ease both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🍪</span>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
            Cookies
          </p>
        </div>
        <button onClick={() => accept(false)}
          style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}>
          ×
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.55, marginBottom: 14 }}>
        Используем cookies для работы сайта и аналитики посещаемости.
        Подробнее в <Link to="/cookies" style={{ color: '#22D3EE', textDecoration: 'none' }}>политике cookies</Link>.
      </p>

      {/* Toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {/* Necessary — always on */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
          <div>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>Необходимые</span>
            <span style={{ color: '#334155', marginLeft: 6 }}>— всегда включены</span>
          </div>
          <span style={{
            display: 'inline-block', width: 32, height: 18, borderRadius: 99,
            background: '#22D3EE', position: 'relative', flexShrink: 0,
            boxShadow: '0 0 8px rgba(34,211,238,.4)',
          }}>
            <span style={{
              position: 'absolute', top: 3, right: 3, width: 12, height: 12,
              borderRadius: '50%', background: '#030508',
            }} />
          </span>
        </label>

        {/* Analytics — toggleable */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, cursor: 'pointer' }}
          onClick={() => setAnalytics(a => !a)}>
          <div>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>Аналитические</span>
            <span style={{ color: '#334155', marginLeft: 6 }}>— улучшают сайт</span>
          </div>
          <span style={{
            display: 'inline-block', width: 32, height: 18, borderRadius: 99,
            background: analytics ? '#22D3EE' : '#1E293B',
            border: analytics ? 'none' : '1px solid #334155',
            position: 'relative', flexShrink: 0,
            transition: 'background .2s',
            boxShadow: analytics ? '0 0 8px rgba(34,211,238,.4)' : 'none',
          }}>
            <span style={{
              position: 'absolute', top: analytics ? 3 : 2, left: analytics ? 'auto' : 2, right: analytics ? 3 : 'auto',
              width: 12, height: 12, borderRadius: '50%',
              background: analytics ? '#030508' : '#475569',
              transition: 'all .2s',
            }} />
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => accept(false)}
          style={{
            flex: 1, padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: 'transparent', color: '#64748B',
            border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { (e.currentTarget.style.color = '#94A3B8'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)') }}
          onMouseLeave={e => { (e.currentTarget.style.color = '#64748B'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)') }}>
          Только нужные
        </button>
        <button onClick={() => accept(true)}
          style={{
            flex: 2, padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: 'rgba(34,211,238,.15)', color: '#22D3EE',
            border: '1px solid rgba(34,211,238,.3)', cursor: 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(34,211,238,.22)'); (e.currentTarget.style.boxShadow = '0 0 12px rgba(34,211,238,.2)') }}
          onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(34,211,238,.15)'); (e.currentTarget.style.boxShadow = 'none') }}>
          Принять все
        </button>
      </div>
    </div>
  )
}
