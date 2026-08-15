import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

const CITIES = ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan', 'Yekaterinburg', 'Omsk', 'Samara']
const SKILLS = ['Python', 'PyTorch', 'Machine Learning', 'LLM', 'Kubernetes', 'MLOps', 'Deep Learning', 'Docker']

const EMP_COLORS: Record<string, string> = {
  'full-time': '#22D3EE',
  'remote': '#10B981',
  'hybrid': '#818CF8',
  'part-time': '#F59E0B',
}

export function VacanciesMap() {
  const [city, setCity] = useState('')
  const [skill, setSkill] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['vacancies', page, city, skill],
    queryFn: () => {
      const p = new URLSearchParams({ skip: String(page * limit), limit: String(limit), ...(city ? { city } : {}), ...(skill ? { skill } : {}) })
      return fetch(`${API}/vacancies?${p}`).then(r => r.json())
    },
  })

  const items: any[] = data?.items ?? []
  const total: number = data?.total ?? 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Вакансии</span>
          {total > 0 && <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>{total} найдено</span>}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #22D3EE)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          AI/ML Вакансии
        </h1>
      </section>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <select value={city} onChange={e => { setCity(e.target.value); setPage(0) }}
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: city ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer' }}>
          <option value="">Все города</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={skill} onChange={e => { setSkill(e.target.value); setPage(0) }}
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: skill ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer' }}>
          <option value="">Все навыки</option>
          {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(city || skill) && (
          <button onClick={() => { setCity(''); setSkill(''); setPage(0) }}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(244,63,94,.1)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.2)', cursor: 'pointer' }}>
            × Сбросить
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: 'var(--text-3)', padding: 40 }}>Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          Вакансии не найдены
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((v: any) => {
            const empColor = EMP_COLORS[v.employment_type] ?? '#475569'
            return (
              <div key={v.id} className="glass" style={{ padding: '18px 22px', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{v.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                      {v.company}
                      <span style={{ margin: '0 8px', opacity: .3 }}>·</span>
                      {v.city}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {v.salary_min ? (
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
                        {v.salary_min.toLocaleString('ru-RU')}{v.salary_max ? ` – ${v.salary_max.toLocaleString('ru-RU')}` : '+'} ₽
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>з/п не указана</p>
                    )}
                    <span style={{
                      display: 'inline-block', marginTop: 5, padding: '2px 8px', borderRadius: 99,
                      fontSize: 11, fontWeight: 500, textTransform: 'capitalize',
                      background: `${empColor}12`, color: empColor, border: `1px solid ${empColor}30`,
                    }}>
                      {v.employment_type}
                    </span>
                  </div>
                </div>
                {v.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
                    {v.skills.slice(0, 8).map((s: string) => (
                      <span key={s} style={{
                        padding: '2px 9px', borderRadius: 99, fontSize: 11,
                        background: 'rgba(255,255,255,.04)', color: '#94A3B8',
                        border: '1px solid rgba(255,255,255,.07)',
                      }}>{s}</span>
                    ))}
                    {v.skills.length > 8 && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>+{v.skills.length - 8}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}
            style={{ opacity: page === 0 ? .4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
            ← Назад
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} из {total}
          </span>
          <button className="btn-ghost" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}
            style={{ opacity: (page + 1) * limit >= total ? .4 : 1, cursor: (page + 1) * limit >= total ? 'not-allowed' : 'pointer' }}>
            Вперёд →
          </button>
        </div>
      )}
    </div>
  )
}
