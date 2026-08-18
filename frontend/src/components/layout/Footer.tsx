export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(3,5,8,.9)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', 
          gap: 'clamp(20px, 4vw, 32px)' 
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, #22D3EE, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#030508',
              }}>AI</span>
              <span style={{ fontWeight: 700, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                Skills<span style={{ color: '#22D3EE' }}>.</span>Analytics
              </span>
            </div>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#475569', lineHeight: 1.6, maxWidth: 260 }}>
              Мониторинг востребованности навыков AI/ML инженеров в реальном времени.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag">React 19</span>
              <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>FastAPI</span>
              <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>Recharts</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#334155' }}>Навигация</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['/', 'Dashboard'], ['/skills', 'Карта навыков'], ['/vacancies', 'Вакансии'], ['/trends', 'Тренды'], ['/analytics', 'Аналитика']].map(([href, name]) => (
                <a key={href} href={href} style={{ 
                  fontSize: 'clamp(12px, 2.8vw, 13px)', 
                  color: '#475569', 
                  textDecoration: 'none', 
                  transition: 'color .2s',
                  minHeight: 'clamp(36px, 8vw, 44px)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#22D3EE')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                  {name}
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }}>
            <p style={{ fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#334155' }}>Контакты</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 'clamp(12px, 2.8vw, 13px)', color: '#475569' }}>
              <p style={{ wordBreak: 'break-word' }}><span style={{ color: '#64748B' }}>Владелец:</span> Богорад Сергей Борисович</p>
              <a href="mailto:sbb@bsosh3.org" style={{ 
                color: '#22D3EE', 
                textDecoration: 'none',
                minHeight: 'clamp(36px, 8vw, 44px)',
                display: 'flex',
                alignItems: 'center',
              }}>sbb@bsosh3.org</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {[
                ['/privacy', 'Политика конфиденциальности'], 
                ['/cookies', 'Использование cookies'], 
                ['/terms', 'Условия использования']
              ].map(([href, name]) => (
                <a key={name} href={href} style={{ 
                  fontSize: 'clamp(11px, 2.5vw, 12px)', 
                  color: '#334155', 
                  textDecoration: 'none', 
                  transition: 'color .2s',
                  minHeight: 'clamp(36px, 8vw, 44px)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: 'clamp(20px, 4vw, 32px)', 
          paddingTop: 'clamp(16px, 3vw, 24px)', 
          borderTop: '1px solid rgba(255,255,255,.04)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 12 
        }}>
          <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#1E293B' }}>© 2026 AI Skills Dashboard · Личный проект для портфолио</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: 'clamp(10px, 2.2vw, 11px)', color: '#1E293B' }}>Live · обновляется ежедневно</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
