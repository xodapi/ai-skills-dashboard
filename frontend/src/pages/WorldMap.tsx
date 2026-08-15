import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const API = '/api/v1'

const EMPLOYMENT_TYPES = [
  { value: '', label: 'Все форматы', color: '#64748B' },
  { value: 'remote', label: '🌐 Удалённо', color: '#10B981' },
  { value: 'hybrid', label: '🔄 Гибрид', color: '#818CF8' },
  { value: 'full-time', label: '🏢 Офис', color: '#F59E0B' },
]

interface LocationData {
  country: string
  count: number
  avg_salary: number
  top_cities: Array<{ city: string; count: number }>
  employment_types: Record<string, number>
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,12,20,.97)', border: '1px solid rgba(34,211,238,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: '#94A3B8', marginBottom: 2 }}>
          {p.name}: <strong style={{ color: p.fill }}>{typeof p.value === 'number' ? p.value.toLocaleString('ru-RU') : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function WorldMap() {
  const [employmentFilter, setEmploymentFilter] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<LocationData | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vacancies-geo', employmentFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (employmentFilter) params.set('employment_type', employmentFilter)
      return fetch(`${API}/vacancies/geo?${params}`).then(r => r.json())
    },
  })

  const locations: LocationData[] = data?.locations ?? []
  const total: number = data?.total ?? 0
  const maxCount = Math.max(...locations.map(l => l.count), 1)

  const chartData = locations.map(l => ({
    country: l.country,
    count: l.count,
    salary: l.avg_salary,
  }))

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">География вакансий</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>
            {total} вакансий
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #22D3EE)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          География вакансий
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 640, lineHeight: 1.7 }}>
          Распределение вакансий по странам и городам с фильтрацией по формату работы (удалённо/гибрид/офис)
        </p>
      </section>

      {/* Employment type filter pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {EMPLOYMENT_TYPES.map(et => {
          const active = employmentFilter === et.value
          const bgColor = active ? et.color + '20' : 'rgba(255,255,255,.03)'
          const borderColor = active ? et.color + '50' : 'rgba(255,255,255,.08)'
          const textColor = active ? et.color : 'var(--text-2)'
          return (
            <button key={et.value}
              onClick={() => setEmploymentFilter(et.value)}
              style={{
                padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                background: bgColor, color: textColor, border: `1.5px solid ${borderColor}`,
                cursor: 'pointer', transition: 'all .2s',
                boxShadow: active ? `0 0 16px ${et.color}20` : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}>
              {et.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="glass" style={{ padding: 80, textAlign: 'center', color: 'var(--text-3)' }}>
          Загрузка данных...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

          {/* Country bar chart */}
          <div className="glass" style={{ padding: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>
              Вакансии по странам
            </p>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <XAxis dataKey="country" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Вакансий" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {chartData.map((d, i) => {
                      const pct = d.count / maxCount
                      const color = pct > 0.7 ? '#10B981' : pct > 0.4 ? '#22D3EE' : '#818CF8'
                      return <Cell key={i} fill={color} fillOpacity={0.8} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Country cards grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
            {locations.map(loc => {
              const isSelected = selectedCountry?.country === loc.country
              const pct = Math.round((loc.count / total) * 100)
              return (
                <button key={loc.country}
                  onClick={() => setSelectedCountry(isSelected ? null : loc)}
                  className="glass"
                  style={{
                    padding: '16px 18px', textAlign: 'left', cursor: 'pointer',
                    border: isSelected ? '1px solid rgba(34,211,238,.4)' : '1px solid rgba(255,255,255,.07)',
                    background: isSelected ? 'rgba(34,211,238,.08)' : 'rgba(255,255,255,.02)',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em', marginBottom: 3 }}>
                        {loc.country}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {loc.count} вакансий ({pct}%)
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#10B981', letterSpacing: '-0.02em' }}>
                        {loc.avg_salary ? (loc.avg_salary / 1000).toFixed(0) + 'k' : '—'}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-3)' }}>₽ ср.</p>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#22D3EE,#10B981)', borderRadius: 99 }} />
                  </div>

                  {/* Top cities mini chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {loc.top_cities.slice(0, 3).map(c => (
                      <span key={c.city} style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 99,
                        background: 'rgba(34,211,238,.08)', color: '#22D3EE', border: '1px solid rgba(34,211,238,.2)',
                      }}>
                        {c.city} · {c.count}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

        </div>
      )}

      {/* Selected country details */}
      {selectedCountry && (
        <div className="glass" style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                {selectedCountry.country}
              </h3>
              <button onClick={() => setSelectedCountry(null)}
                style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.2)', borderRadius: 6, padding: '4px 10px', color: '#F43F5E', cursor: 'pointer', fontSize: 12 }}>
                Закрыть
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: '#10B981', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Средняя зарплата</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#10B981', letterSpacing: '-0.03em' }}>
                  {selectedCountry.avg_salary ? (selectedCountry.avg_salary / 1000).toFixed(0) + 'k ₽' : '—'}
                </p>
              </div>
              <div style={{ background: 'rgba(34,211,238,.08)', border: '1px solid rgba(34,211,238,.2)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 11, color: '#22D3EE', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Вакансий всего</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#22D3EE', letterSpacing: '-0.03em' }}>
                  {selectedCountry.count}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Формат работы</p>
            {Object.entries(selectedCountry.employment_types).map(([type, count]) => {
              const et = EMPLOYMENT_TYPES.find(t => t.value === type)
              const pct = Math.round((count / selectedCountry.count) * 100)
              return (
                <div key={type} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: et?.color ?? 'var(--text-2)', fontWeight: 500 }}>{et?.label ?? type}</span>
                    <span style={{ color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: et?.color ?? '#475569', borderRadius: 99, opacity: .85 }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Топ городов</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedCountry.top_cities.map((c, i) => (
                <div key={c.city} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 11px', background: 'rgba(255,255,255,.03)', borderRadius: 7, border: '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', minWidth: 20 }}>#{i + 1}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{c.city}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22D3EE' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
