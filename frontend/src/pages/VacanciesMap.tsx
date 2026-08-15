import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

const CITIES = ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan', 'Yekaterinburg', 'Omsk', 'Samara', 'Nizhny Novgorod']
const SKILLS = ['Python', 'PyTorch', 'Machine Learning', 'LLM', 'Kubernetes', 'MLOps', 'Deep Learning', 'Docker', 'SQL', 'TensorFlow']

const EMP_COLORS: Record<string, string> = {
  'full-time': '#22D3EE',
  'remote':    '#10B981',
  'hybrid':    '#818CF8',
  'part-time': '#F59E0B',
}

const EMP_LABELS: Record<string, string> = {
  'full-time': 'Офис',
  'remote':    'Удалёнка',
  'hybrid':    'Гибрид',
  'part-time': 'Частичная',
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useState<ReturnType<typeof setTimeout> | null>(null)

  const update = useCallback((v: T) => {
    if (timer[0]) clearTimeout(timer[0])
    timer[1](setTimeout(() => setDebounced(v), delay))
  }, [delay, timer])

  // Update on value change
  useState(() => { update(value) })

  return debounced
}

interface Vacancy {
  id: number
  title: string
  company: string
  description: string
  requirements: string
  city: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  experience_years: number
  employment_type: string
  url: string
  published_at: string
  skills: string[]
}

export function VacanciesMap() {
  const [city, setCity] = useState('')
  const [skill, setSkill] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const limit = 20

  // Debounce search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (v: string) => {
    setSearch(v)
    if (debounceTimer) clearTimeout(debounceTimer)
    const t = setTimeout(() => {
      setDebouncedSearch(v)
      setPage(0)
    }, 350)
    setDebounceTimer(t)
  }

  const resetFilters = () => {
    setCity(''); setSkill(''); setSearch(''); setDebouncedSearch(''); setPage(0)
  }
  const hasFilters = city || skill || debouncedSearch

  const { data, isLoading } = useQuery({
    queryKey: ['vacancies', page, city, skill, debouncedSearch],
    queryFn: () => {
      const p = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...(city             ? { city }            : {}),
        ...(skill             ? { skill }           : {}),
        ...(debouncedSearch   ? { search: debouncedSearch } : {}),
      })
      return fetch(`${API}/vacancies?${p}`).then(r => r.json())
    },
  })

  const items: Vacancy[] = data?.items ?? []
  const total: number = data?.total ?? 0

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Вакансии</span>
          {total > 0 && (
            <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>
              {total} найдено
            </span>
          )}
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
        {/* Text search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: 200, maxWidth: 360 }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            className="input"
            placeholder="Поиск по названию или компании…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ paddingLeft: 32, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

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

        {hasFilters && (
          <button onClick={resetFilters}
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(244,63,94,.1)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.2)', cursor: 'pointer' }}>
            × Сбросить
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ color: 'var(--text-3)', padding: 40, textAlign: 'center' }}>Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          Вакансии не найдены
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((v: Vacancy) => {
            const empColor = EMP_COLORS[v.employment_type] ?? '#475569'
            const empLabel = EMP_LABELS[v.employment_type] ?? v.employment_type
            const isOpen = expanded === v.id
            const pubDate = v.published_at
              ? new Date(v.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
              : null

            return (
              <div key={v.id} className="glass"
                style={{ overflow: 'hidden', transition: 'box-shadow .2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34,211,238,.15), 0 4px 24px rgba(0,0,0,.4)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>

                {/* Card header — clickable to expand */}
                <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => toggle(v.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>

                    {/* Left: title + meta */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                          {v.title}
                        </p>
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: `${empColor}12`, color: empColor, border: `1px solid ${empColor}30`,
                        }}>
                          {empLabel}
                        </span>
                        {v.experience_years > 0 && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 99, fontSize: 11,
                            background: 'rgba(129,140,248,.1)', color: '#818CF8',
                            border: '1px solid rgba(129,140,248,.25)',
                          }}>
                            {v.experience_years} {v.experience_years === 1 ? 'год' : v.experience_years < 5 ? 'года' : 'лет'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#94A3B8' }}>{v.company}</span>
                        <span style={{ opacity: .3 }}>·</span>
                        <span>{v.city}</span>
                        {pubDate && <><span style={{ opacity: .3 }}>·</span><span>{pubDate}</span></>}
                      </p>
                    </div>

                    {/* Right: salary + expand arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        {v.salary_min ? (
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
                            {v.salary_min.toLocaleString('ru-RU')}
                            {v.salary_max ? ` – ${v.salary_max.toLocaleString('ru-RU')}` : '+'}
                            {' '}₽
                          </p>
                        ) : (
                          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>з/п не указана</p>
                        )}
                      </div>
                      <svg style={{ color: 'var(--text-3)', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {/* Skills row */}
                  {v.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                      {v.skills.slice(0, 9).map((s: string) => (
                        <span key={s} style={{
                          padding: '2px 9px', borderRadius: 99, fontSize: 11,
                          background: 'rgba(255,255,255,.04)', color: '#94A3B8',
                          border: '1px solid rgba(255,255,255,.07)',
                        }}>
                          {s}
                        </span>
                      ))}
                      {v.skills.length > 9 && (
                        <span style={{ fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>
                          +{v.skills.length - 9}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,.05)',
                    padding: '16px 20px 20px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                    animation: 'fadeUp .18s ease both',
                  }}>
                    {v.description && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                          О позиции
                        </p>
                        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65 }}>{v.description}</p>
                      </div>
                    )}
                    {v.requirements && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                          Требования
                        </p>
                        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65 }}>{v.requirements}</p>
                      </div>
                    )}
                    {v.url && (
                      <div style={{ paddingTop: 4 }}>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                            background: 'rgba(34,211,238,.1)', color: '#22D3EE',
                            border: '1px solid rgba(34,211,238,.25)',
                            textDecoration: 'none', transition: 'all .2s',
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLAnchorElement
                            el.style.background = 'rgba(34,211,238,.18)'
                            el.style.boxShadow = '0 0 16px rgba(34,211,238,.2)'
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLAnchorElement
                            el.style.background = 'rgba(34,211,238,.1)'
                            el.style.boxShadow = 'none'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Открыть на HH.ru
                        </a>
                      </div>
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
