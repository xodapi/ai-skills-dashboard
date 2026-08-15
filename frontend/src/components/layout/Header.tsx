import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { name: 'Dashboard', href: '/', icon: '◈' },
  { name: 'Навыки', href: '/skills', icon: '⬡' },
  { name: 'Вакансии', href: '/vacancies', icon: '◉' },
  { name: 'Тренды', href: '/trends', icon: '∿' },
  { name: 'Аналитика', href: '/analytics', icon: '⊞' },
]

export function Header() {
  const { pathname } = useLocation()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(3,5,8,.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    }}>
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 40 }}>

          {/* Logo */}
          <Link to="/" style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #22D3EE, #818CF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#030508',
              boxShadow: '0 0 16px rgba(34,211,238,.4)',
            }}>AI</span>
            <span style={{
              fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em',
              color: '#F1F5F9',
            }}>
              Skills<span style={{ color: '#22D3EE' }}>.</span>Analytics
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {NAV.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} to={item.href} style={{
                  textDecoration: 'none',
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  color: active ? '#22D3EE' : '#94A3B8',
                  background: active ? 'rgba(34,211,238,.1)' : 'transparent',
                  border: active ? '1px solid rgba(34,211,238,.2)' : '1px solid transparent',
                  transition: 'all .2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 11, opacity: .7 }}>{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 12, color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
              Live data
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
}
