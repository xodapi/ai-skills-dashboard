import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const API = '/api/v1'

type Horizon = '1m' | '3m' | '6m' | '12m'
type Trend = 'rising' | 'stable' | 'falling'

interface ForecastItem {
  skill: string
  current_demand: number
  vacancy_count: number
  momentum: number
  forecast_growth_pct: number
  trend: Trend
}

interface ForecastResponse {
  horizon: Horizon
  generated_at: string
  items: ForecastItem[]
}

const TREND_STYLE: Record<Trend, { color: string; icon: string; label: string; bg: string }> = {
  rising:  { color: '#10B981', icon: '↑', label: 'Растёт',   bg: 'rgba(16,185,129,.08)' },
  stable:  { color: '#94A3B8', icon: '→', label: 'Стабильно', bg: 'rgba(148,163,184,.08)' },
  falling: { color: '#F43F5E', icon: '↓', label: 'Падает',   bg: 'rgba(244,63,94,.06)' },
}

const HORIZON_LABELS: Record<Horizon, string> = {
  '1m': '1 месяц', '3m': '3 месяца', '6m': '6 месяцев', '12m': '1 год',
}

function pctColor(v: number) {
  if (v > 8) return '#10B981'
  if (v > 2) return '#22D3EE'
  if (v >= -2) return '#94A3B8'
  if (v >= -8) return '#F59E0B'
  return '#F43F5E'
}

function fmt(n: number, sign = false) {
  const s = sign && n > 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}

export function SkillsForecast() {
  const [horizon, setHorizon] = useState<Horizon>('3m')
  const [filter, setFilter] = useState<Trend | 'all'>('all')

  const { data, isFetching, isError } = useQuery<ForecastResponse>({
    queryKey: ['skills-forecast', horizon],
    queryFn: () =>
      fetch(`${API}/skills/forecast?horizon=${horizon}&top_n=30`).then(r => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      }),
    staleTime: 5 * 60_000,
  })

  const items: ForecastItem[] = data?.items ?? []

  const filtered = filter === 'all' ? items : items.filter(i => i.trend === filter)

  const rising  = items.filter(i => i.trend === 'rising').length
  const stable  = items.filter(i => i.trend === 'stable').length
  const falling = items.filter(i => i.trend === 'falling').length

  // Top 8 rising for bar chart
  const topRising = [...items]
    .filter(i => i.forecast_growth_pct > 0)
    .sort((a, b) => b.forecast_growth_pct - a.forecast_growth_pct)
    .slice(0, 8)

  const maxGrowth = topRising[0]?.forecast_growth_pct ?? 1

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Skills Forecast</span>
          <span className="tag" style={{ background: 'rgba(34,211,238,.1)', color: '#22D3EE', borderColor: 'rgba(34,211,238,.25)' }}>
            Momentum model
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Прогноз спроса на навыки
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 560, lineHeight: 1.7 }}>
          Momentum-модель по данным вакансий: какие навыки растут, стабильны или теряют спрос.
        </p>
      </section>

      {/* Horizon switcher */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginRight: 4 }}>Горизонт:</span>
        {(['1m', '3m', '6m', '12m'] as Horizon[]).map(h => (
          <button key={h} onClick={() => setHorizon(h)}
            style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: horizon === h ? 'var(--accent-dim)' : 'transparent',
              color: horizon === h ? 'var(--accent)' : 'var(--text-2)',
              border: horizon === h
                ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)'
                : '1px solid var(--border)',
              cursor: 'pointer', transition: 'all .15s',
            }}>
            {HORIZON_LABELS[h]}
          </button>
        ))}
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {(['rising', 'stable', 'falling'] as Trend[]).map(t => {
          const st = TREND_STYLE[t]
          const count = t === 'rising' ? rising : t === 'stable' ? stable : falling
          return (
            <button key={t} onClick={() => setFilter(filter === t ? 'all' : t)}
              style={{
                padding: '18px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                background: filter === t ? st.bg : 'var(--surface-2)',
                border: filter === t ? `1px solid color-mix(in srgb, ${st.color} 35%, transparent)` : '1px solid var(--border)',
                transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 6,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: st.color }}>{st.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: st.color }}>{st.label}</span>
              </div>
              <p style={{ fontSize: 32, fontWeight: 900, color: st.color, letterSpacing: '-0.04em' }}>{count}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>навыков</p>
            </button>
          )
        })}
      </div>

      {/* Loading / error */}
      {isFetching && (
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>⏳ Вычисляю прогноз…</p>
        </div>
      )}
      {isError && (
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#F43F5E' }}>Ошибка загрузки. Убедитесь что backend запущен.</p>
        </div>
      )}

      {!isFetching && !isError && items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'start' }}>

          {/* Bar chart — top rising */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Топ навыков по росту ({HORIZON_LABELS[horizon]})
            </p>
            {topRising.map(item => (
              <div key={item.skill} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{item.skill}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{fmt(item.forecast_growth_pct, true)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${(item.forecast_growth_pct / maxGrowth) * 100}%`,
                    background: 'linear-gradient(90deg, #10B981, #22D3EE)',
                    transition: 'width .4s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.vacancy_count} вакансий</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    momentum {item.momentum > 0 ? '+' : ''}{(item.momentum * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            <Link to="/skills"
              style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', marginTop: 8, display: 'block' }}>
              Все навыки →
            </Link>
          </div>

          {/* Full table */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Все навыки {filter !== 'all' && `· ${TREND_STYLE[filter].label}`}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')}
                  style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Сбросить
                </button>
              )}
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px 64px', gap: 8, padding: '6px 10px',
              fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em',
              borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              <span>Навык</span>
              <span style={{ textAlign: 'right' }}>Вакансий</span>
              <span style={{ textAlign: 'right' }}>Прогноз</span>
              <span style={{ textAlign: 'right' }}>Тренд</span>
            </div>

            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {filtered.map(item => {
                const st = TREND_STYLE[item.trend]
                return (
                  <div key={item.skill}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px 64px', gap: 8,
                      padding: '8px 10px', borderRadius: 8, alignItems: 'center',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-4)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.skill}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>
                      {item.vacancy_count}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(item.forecast_growth_pct), textAlign: 'right' }}>
                      {fmt(item.forecast_growth_pct, true)}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99,
                        background: st.bg, color: st.color,
                        border: `1px solid color-mix(in srgb, ${st.color} 25%, transparent)`,
                        fontWeight: 700 }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '20px 10px', textAlign: 'center' }}>
                  Нет данных для выбранного фильтра
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {!isFetching && !isError && items.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/salary-calculator"
            style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
            💰 Рассчитать зарплату
          </Link>
          <Link to="/assessment"
            style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
            🧠 Пройти тест навыков
          </Link>
          <Link to="/roadmap"
            style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--surface-4)', color: 'var(--text-2)', textDecoration: 'none', border: '1px solid var(--border)' }}>
            🗺️ Role Roadmap
          </Link>
        </div>
      )}
    </div>
  )
}
