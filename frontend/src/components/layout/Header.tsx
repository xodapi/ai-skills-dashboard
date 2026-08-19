import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { useAuth } from '@/context/AuthContext'

// ── Navigation groups ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Аналитика',
    icon: '⬡',
    items: [
      { name: 'Dashboard',  href: '/',           icon: '◈' },
      { name: 'Навыки',     href: '/skills',      icon: '⬡' },
      { name: 'Наборы',     href: '/skillsets',   icon: '⋈' },
      { name: 'Вакансии',   href: '/vacancies',   icon: '◉' },
      { name: 'География',  href: '/worldmap',    icon: '◐' },
      { name: 'Тренды',     href: '/trends',      icon: '∿' },
      { name: 'Аналитика',  href: '/analytics',   icon: '⊞' },
      { name: 'Радар',      href: '/radar',       icon: '◎' },
      { name: 'Пробелы',    href: '/gap-analyzer',icon: '⊕' },
      { name: 'Открытия',   href: '/discovery',   icon: '◬' },
    ],
  },
  {
    label: 'Карьера',
    icon: '💼',
    items: [
      { name: 'Зарплата',   href: '/salary-calculator', icon: '💰' },
      { name: 'Roadmap',    href: '/roadmap',            icon: '🗺️' },
      { name: 'Тренажёры',  href: '/trainers',           icon: '🎓' },
      { name: 'Тест IQ',    href: '/assessment',         icon: '🧠' },
      { name: 'Прогноз',    href: '/forecast',           icon: '📈' },
    ],
  },
  {
    label: 'Профиль',
    icon: '👤',
    items: [
      { name: 'GitHub Import', href: '/github-import', icon: '⬡' },
      { name: 'Мои навыки',    href: '/my-skills',     icon: '✎' },
      { name: 'Закладки',      href: '/bookmarks',     icon: '🔖' },
    ],
  },
]

// Flat list for active detection
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items)

// ── Mobile menu component ────────────────────────────────────────────────────
function MobileMenu({ pathname, onClose, isAdmin }: { pathname: string; onClose: () => void; isAdmin: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
          zIndex: 999, backdropFilter: 'blur(4px)',
          animation: 'fadeIn .2s ease-out',
        }}
      />

      {/* Menu panel */}
      <div
        ref={ref}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100vw',
          maxWidth: 640,
          background: 'var(--surface-1)',
          borderLeft: '1px solid var(--border)',
          zIndex: 1000,
          overflowY: 'auto',
          animation: 'slideInRight .25s ease-out',
          boxShadow: '-8px 0 32px rgba(0,0,0,.5)',
        }}
      >
        {/* Close button */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: 'var(--text-2)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-4)'
              e.currentTarget.style.borderColor = 'var(--border-hi)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-3)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation groups */}
        <div style={{ padding: '14px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.08em', color: 'var(--text-3)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{group.icon}</span>
                {group.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 5 }}>
                {group.items.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                        color: active ? 'var(--accent)' : 'var(--text-2)',
                        background: active ? 'var(--accent-dim)' : 'transparent',
                        border: active ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' : '1px solid transparent',
                        fontSize: 12, fontWeight: active ? 600 : 400,
                        transition: 'all .15s',
                        minHeight: 38,
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-4)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.name}</span>
                      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.08em', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>🔐</span> Администрирование
              </div>
              <Link to="/admin" onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                textDecoration: 'none', color: pathname.startsWith('/admin') ? '#FBBF24' : 'var(--text-2)',
                background: pathname.startsWith('/admin') ? 'rgba(245,158,11,.1)' : 'transparent',
                border: '1px solid rgba(245,158,11,.22)', fontSize: 12, minHeight: 38,
              }}>
                <span>▣</span><span>Панель администратора</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Dropdown component ───────────────────────────────────────────────────────
function NavDropdown({
  group,
  pathname,
}: {
  group: typeof NAV_GROUPS[number]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isGroupActive = group.items.some(i => i.href === pathname)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          background: isGroupActive ? 'var(--accent-dim)' : open ? 'var(--surface-4)' : 'transparent',
          border: isGroupActive
            ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)'
            : '1px solid transparent',
          color: isGroupActive ? 'var(--accent)' : 'var(--text-2)',
          fontSize: 13, fontWeight: 500, transition: 'all .15s',
        }}
        onMouseEnter={e => { if (!isGroupActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-4)' }}
        onMouseLeave={e => { if (!isGroupActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        <span style={{ fontSize: 11, opacity: .7 }}>{group.icon}</span>
        {group.label}
        <span style={{
          fontSize: 9, opacity: .6,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform .2s',
          display: 'inline-block',
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: 'color-mix(in srgb, var(--surface-2) 97%, transparent)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04)',
          padding: '6px',
          minWidth: 180,
          zIndex: 100,
        }}>
          {group.items.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: 'all .1s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-4)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center', opacity: .8 }}>{item.icon}</span>
                {item.name}
                {active && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
export function Header() {
  const { pathname } = useLocation()
  const { user, token, isAuthenticated, login, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: gamification } = useQuery<{
    total_xp: number
    level: number
    current_streak: number
  }>({
    queryKey: ['gamification', token],
    queryFn: () =>
      fetch('/api/v1/users/me/gamification', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(response => response.json()),
    enabled: !!token,
    staleTime: 60_000,
  })

  // Current page label for breadcrumb hint
  const currentItem = ALL_ITEMS.find(i => i.href === pathname)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in srgb, var(--surface-1) 92%, transparent)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      transition: 'background .35s, border-color .35s',
    }}>
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 24px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 56, gap: 'clamp(6px, 2vw, 8px)' }}>

          {/* Logo */}
          <Link to="/" style={{
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 8px)',
            flexShrink: 0, marginRight: 'clamp(4px, 2vw, 8px)',
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'var(--bg)',
              boxShadow: 'var(--glow-sm)', flexShrink: 0,
            }}>AI</span>
            <span style={{
              fontWeight: 700, fontSize: 'clamp(13px, 3.5vw, 15px)', letterSpacing: '-0.02em', color: 'var(--text-1)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Skills<span style={{ color: 'var(--accent)' }}>.</span><span className="hide-on-mobile">Analytics</span>
            </span>
          </Link>

          {/* Divider - desktop only */}
          <div className="hide-on-mobile" style={{ width: 1, height: 22, background: 'var(--border)', flexShrink: 0 }} />

          {/* Desktop nav - hidden on mobile */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
            {NAV_GROUPS.map(group => (
              <NavDropdown key={group.label} group={group} pathname={pathname} />
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" style={{
                marginLeft: 4, padding: '6px 10px', borderRadius: 8, textDecoration: 'none',
                color: pathname.startsWith('/admin') ? '#FBBF24' : 'var(--text-2)',
                background: pathname.startsWith('/admin') ? 'rgba(245,158,11,.1)' : 'transparent',
                border: '1px solid rgba(245,158,11,.2)', fontSize: 12, fontWeight: 700,
              }}>
                🔐 Admin
              </Link>
            )}

            {/* Current page breadcrumb pill */}
            {currentItem && (
              <span style={{
                marginLeft: 8, fontSize: 11, padding: '3px 10px', borderRadius: 99,
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {currentItem.icon} {currentItem.name}
              </span>
            )}
          </div>

          {/* Spacer for mobile */}
          <div className="show-on-mobile" style={{ flex: 1 }} />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 10px)', flexShrink: 0 }}>
            <ThemeSwitcher />

            {/* Auth - desktop version */}
            {!isLoading && (
              isAuthenticated && user ? (
                <>
                {gamification && (
                  <Link to="/profile" className="hide-on-mobile" style={{
                    display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                    padding: '5px 9px', borderRadius: 99, background: 'var(--accent-dim)',
                    border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
                    color: 'var(--accent)', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>
                    <span>⚡ {gamification.total_xp} XP</span>
                    <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>Lv.{gamification.level}</span>
                    {gamification.current_streak > 0 && <span>🔥 {gamification.current_streak}</span>}
                  </Link>
                )}
                <Link to="/profile" className="hide-on-mobile" style={{
                  display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                  padding: '4px 10px 4px 4px', borderRadius: 99,
                  background: 'var(--surface-4)', border: '1px solid var(--border)',
                  transition: 'border-color .15s',
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.login}
                      style={{ width: 22, height: 22, borderRadius: '50%', display: 'block' }} />
                  ) : (
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900, color: 'var(--accent)',
                    }}>
                      {user.login[0].toUpperCase()}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name ?? user.login}
                  </span>
                </Link>
                </>
              ) : (
                <button onClick={login} className="hide-on-mobile" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                  Войти
                </button>
              )
            )}

            {/* Mobile: Avatar or Login icon */}
            {!isLoading && (
              isAuthenticated && user ? (
                <Link to="/profile" className="show-on-mobile" style={{
                  display: 'none', width: 36, height: 36, borderRadius: '50%',
                  overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0,
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.login} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
                  ) : (
                    <span style={{
                      width: '100%', height: '100%', background: 'var(--accent-dim)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 900, color: 'var(--accent)',
                    }}>
                      {user.login[0].toUpperCase()}
                    </span>
                  )}
                </Link>
              ) : (
                <button onClick={login} className="show-on-mobile" style={{
                  display: 'none', width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--accent)', border: 'none', cursor: 'pointer',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </button>
              )
            )}

            {/* Live dot - desktop only */}
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Live</span>
            </div>

            {/* Hamburger menu button - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="show-on-mobile"
              style={{
                display: 'none', width: 40, height: 40, borderRadius: 8,
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                flexDirection: 'column', gap: 4, padding: 0, flexShrink: 0,
                transition: 'all .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-4)'
                e.currentTarget.style.borderColor = 'var(--border-hi)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface-3)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <span style={{ width: 18, height: 2, background: 'var(--text-2)', borderRadius: 2 }} />
              <span style={{ width: 18, height: 2, background: 'var(--text-2)', borderRadius: 2 }} />
              <span style={{ width: 18, height: 2, background: 'var(--text-2)', borderRadius: 2 }} />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && <MobileMenu pathname={pathname} onClose={() => setMobileMenuOpen(false)} isAdmin={user?.role === 'admin'} />}
    </header>
  )
}
