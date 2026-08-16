import { Link, useLocation } from 'react-router-dom'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

const NAV = [
  { name: 'Dashboard', href: '/', icon: '◈' },
  { name: 'Навыки', href: '/skills', icon: '⬡' },
  { name: 'Наборы', href: '/skillsets', icon: '⋈' },
  { name: 'Вакансии', href: '/vacancies', icon: '◉' },
  { name: 'География', href: '/worldmap', icon: '◐' },
  { name: 'Тренды', href: '/trends', icon: '∿' },
  { name: 'Аналитика', href: '/analytics', icon: '⊞' },
  { name: 'Радар', href: '/radar', icon: '◎' },
  { name: 'Пробелы', href: '/gap-analyzer', icon: '⊕' },
]

export function Header() {
  const { pathname } = useLocation()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in srgb, var(--surface-1) 90%, transparent)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      transition: 'background .35s, border-color .35s',
    }}>
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>

          {/* Logo */}
          <Link to="/" style={{
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'var(--bg)',
              boxShadow: 'var(--glow-sm)',
            }}>AI</span>
            <span style={{
              fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em',
              color: 'var(--text-1)',
            }}>
              Skills<span style={{ color: 'var(--accent)' }}>.</span>Analytics
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
            {NAV.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} to={item.href} style={{
                  textDecoration: 'none',
                  padding: '6px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  border: active
                    ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)'
                    : '1px solid transparent',
                  transition: 'all .2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ fontSize: 11, opacity: .7 }}>{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right: ThemeSwitcher + Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <ThemeSwitcher />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                Live
              </span>
            </div>
          </div>

        </div>
      </nav>
    </header>
  )
}
