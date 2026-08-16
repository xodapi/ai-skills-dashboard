import { useState } from 'react'
import { useTheme, THEMES, Theme } from '@/context/ThemeContext'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const current = THEMES.find(t => t.id === theme) ?? THEMES[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Сменить тему"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          background: 'var(--accent-dim)', color: 'var(--accent)',
          border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
          cursor: 'pointer', transition: 'all .2s',
        }}>
        <span style={{ fontSize: 14 }}>{current.icon}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 10, opacity: .6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 6, zIndex: 200, minWidth: 180,
          boxShadow: 'var(--glow-md)', backdropFilter: 'blur(20px)',
        }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id as Theme); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 12px', borderRadius: 8,
                background: theme === t.id ? 'var(--accent-dim)' : 'transparent',
                border: theme === t.id ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' : '1px solid transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
              }}
              onMouseEnter={e => { if (theme !== t.id) e.currentTarget.style.background = 'var(--surface-4)' }}
              onMouseLeave={e => { if (theme !== t.id) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{t.icon}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: theme === t.id ? 'var(--accent)' : 'var(--text-1)', lineHeight: 1.3 }}>{t.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.3 }}>{t.desc}</p>
              </div>
              {theme === t.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
