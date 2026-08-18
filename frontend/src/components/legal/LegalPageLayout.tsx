import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LegalSection {
  title: string
  content: ReactNode
}

interface LegalPageLayoutProps {
  eyebrow: string
  title: string
  lead: string
  sections: LegalSection[]
}

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Конфиденциальность' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/terms', label: 'Условия использования' },
]

export function LegalPageLayout({ eyebrow, title, lead, sections }: LegalPageLayoutProps) {
  return (
    <main style={{
      width: '100%',
      maxWidth: 940,
      margin: '0 auto',
      padding: 'clamp(28px, 6vw, 64px) clamp(16px, 4vw, 24px)',
    }}>
      <article style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vw, 32px)' }}>
        <header className="glass" style={{ padding: 'clamp(22px, 5vw, 42px)' }}>
          <p style={{
            marginBottom: 10,
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}>
            {eyebrow}
          </p>
          <h1 style={{
            margin: 0,
            color: 'var(--text-1)',
            fontSize: 'clamp(28px, 6vw, 42px)',
            lineHeight: 1.12,
            letterSpacing: '-.035em',
          }}>
            {title}
          </h1>
          <p style={{
            marginTop: 18,
            maxWidth: 720,
            color: 'var(--text-2)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: 1.65,
          }}>
            {lead}
          </p>
          <p style={{ marginTop: 18, color: 'var(--text-3)', fontSize: 12 }}>
            Дата последнего обновления: 18 августа 2026 года
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sections.map((section) => (
            <section key={section.title} className="glass" style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
              <h2 style={{
                margin: '0 0 12px',
                color: 'var(--text-1)',
                fontSize: 'clamp(18px, 3.5vw, 22px)',
                lineHeight: 1.3,
              }}>
                {section.title}
              </h2>
              <div className="legal-page-content">{section.content}</div>
            </section>
          ))}
        </div>

        <aside style={{
          padding: '18px clamp(18px, 4vw, 24px)',
          borderRadius: 'var(--r-md)',
          background: 'var(--accent-dim)',
          border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>
            Эти документы описывают работу сервиса в текущем виде и не являются юридической консультацией.
            Перед коммерческим запуском, обработкой чувствительных данных или расширением географии сервиса
            попросите юриста проверить их применимость к вашей ситуации.
          </p>
        </aside>

        <nav aria-label="Правовые документы" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
        }}>
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '8px 14px',
                borderRadius: 999,
                color: 'var(--accent)',
                background: 'var(--accent-dim)',
                border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </article>
    </main>
  )
}
