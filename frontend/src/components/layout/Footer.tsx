export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(3,5,8,.9)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #22D3EE, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#030508',
              }}>AI</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                Skills<span style={{ color: '#22D3EE' }}>.</span>Analytics
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, maxWidth: 260 }}>
              Мониторинг востребованности навыков AI/ML инженеров в реальном времени.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="tag">React 19</span>
              <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>FastAPI</span>
              <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>Recharts</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#334155' }}>Навигация</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/', 'Dashboard'], ['/skills', 'Карта навыков'], ['/vacancies', 'Вакансии'], ['/trends', 'Тренды'], ['/analytics', 'Аналитика']].map(([href, name]) => (
                <a key={href} href={href} style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#22D3EE')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  {name}
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#334155' }}>Контакты</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
              <p><span style={{ color: '#64748B' }}>Владелец:</span> Богорад Сергей Борисович</p>
              <a href="mailto:sbb@bsosh3.org" style={{ color: '#22D3EE', textDecoration: 'none' }}>sbb@bsosh3.org</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {[['#', 'Политика конфиденциальности'], ['#', 'Использование cookies'], ['#', 'Условия использования']].map(([href, name]) => (
                <a key={name} href={href} style={{ fontSize: 12, color: '#334155', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#1E293B' }}>© 2026 AI Skills Dashboard · Личный проект для портфолио</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 11, color: '#1E293B' }}>Live · обновляется ежедневно</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
