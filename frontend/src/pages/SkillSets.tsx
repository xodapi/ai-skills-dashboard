import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const API = '/api/v1'

const COMPLEXITY_ORDER = ['research', 'senior_eng', 'ml_engineer', 'junior_vibe']
const COMPLEXITY_META: Record<string, { label: string; color: string; icon: string; vibe_ok: boolean }> = {
  research:    { label: 'Research / PhD',       color: '#F43F5E', icon: '🔬', vibe_ok: false },
  senior_eng:  { label: 'Senior Engineer',      color: '#818CF8', icon: '⚙️',  vibe_ok: false },
  ml_engineer: { label: 'ML Engineer',          color: '#22D3EE', icon: '🤖', vibe_ok: false },
  junior_vibe: { label: 'Junior / Vibe-coder',  color: '#10B981', icon: '⚡', vibe_ok: true  },
}

interface Archetype {
  archetype_id: string
  archetype_label: string
  complexity: string
  math_required: boolean
  count: number
  avg_salary: number
  avg_experience: number
  top_skills: string[]
}

interface Combination {
  skills: string[]
  count: number
  percentage: number
}

interface ComplexityRow {
  complexity: string
  label: string
  color: string
  description: string
  vibe_ok: boolean
  count: number
  avg_salary: number
  math_count: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,12,20,.97)', border: '1px solid rgba(34,211,238,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#22D3EE', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: '#94A3B8' }}>
          {p.name}: <strong style={{ color: '#F1F5F9' }}>{typeof p.value === 'number' ? p.value.toLocaleString('ru-RU') : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function SkillSets() {
  const [activeComplexity, setActiveComplexity] = useState<string | null>(null)

  const { data: complexityData } = useQuery({
    queryKey: ['complexity'],
    queryFn: () => fetch(`${API}/vacancies/complexity/breakdown`).then(r => r.json()),
  })
  const { data: archetypesData } = useQuery({
    queryKey: ['archetypes'],
    queryFn: () => fetch(`${API}/vacancies/archetypes`).then(r => r.json()),
  })
  const { data: combinationsData } = useQuery({
    queryKey: ['combinations'],
    queryFn: () => fetch(`${API}/skills/combinations`).then(r => r.json()),
  })

  const complexity: ComplexityRow[] = (complexityData?.complexity_breakdown ?? [])
    .sort((a: ComplexityRow, b: ComplexityRow) =>
      COMPLEXITY_ORDER.indexOf(a.complexity) - COMPLEXITY_ORDER.indexOf(b.complexity)
    )
  const archetypes: Archetype[] = archetypesData?.archetypes ?? []
  const combinations: Combination[] = combinationsData?.combinations ?? []
  const total: number = archetypesData?.total ?? 0

  const filteredArchetypes = activeComplexity
    ? archetypes.filter(a => a.complexity === activeComplexity)
    : archetypes

  const salaryChartData = complexity.map(c => ({
    name: COMPLEXITY_META[c.complexity]?.label ?? c.label,
    salary: c.avg_salary,
    count: c.count,
    color: COMPLEXITY_META[c.complexity]?.color ?? '#475569',
  }))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Наборы навыков</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>
            {total} вакансий
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #818CF8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Наборы навыков
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 640, lineHeight: 1.7 }}>
          Один навык ничего не значит — работодатели ищут комбинации. Ниже показано, какие наборы
          реально требуются в каждой роли и насколько она доступна без глубокого математического бэкграунда.
        </p>
      </section>

      {/* Complexity overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {complexity.map(c => {
          const meta = COMPLEXITY_META[c.complexity] ?? {}
          const active = activeComplexity === c.complexity
          const pct = total ? Math.round(c.count / total * 100) : 0
          return (
            <button key={c.complexity}
              onClick={() => setActiveComplexity(active ? null : c.complexity)}
              style={{
                background: active ? `${meta.color}12` : 'rgba(255,255,255,.02)',
                border: `1px solid ${active ? meta.color + '40' : 'rgba(255,255,255,.07)'}`,
                borderRadius: 14, padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
                transition: 'all .2s',
                boxShadow: active ? `0 0 20px ${meta.color}20` : 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)') }}
              onMouseLeave={e => { if (!active) (e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                {c.vibe_ok && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: 'rgba(16,185,129,.15)', color: '#10B981', border: '1px solid rgba(16,185,129,.3)',
                    letterSpacing: '.05em',
                  }}>VIBE OK</span>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: meta.color, marginBottom: 4 }}>{meta.label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 12 }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em' }}>{c.count}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>вакансий ({pct}%)</p>
                </div>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#10B981', letterSpacing: '-0.03em' }}>
                    {c.avg_salary ? (c.avg_salary / 1000).toFixed(0) + 'k' : '—'}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>ср. зарплата ₽</p>
                </div>
              </div>
              {/* mini progress bar */}
              <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: 99, opacity: .7 }} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Salary by complexity + bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>

        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Математика в требованиях</p>
          {complexity.map(c => {
            const meta = COMPLEXITY_META[c.complexity] ?? {}
            const mathPct = c.count ? Math.round(c.math_count / c.count * 100) : 0
            return (
              <div key={c.complexity}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
                  <span style={{ fontSize: 12, color: mathPct > 50 ? '#F43F5E' : 'var(--text-3)' }}>{mathPct}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${mathPct}%`, height: '100%', background: mathPct > 50 ? '#F43F5E' : meta.color, borderRadius: 99, opacity: .8, transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.6 }}>
            % вакансий в категории, где явно требуется математика / теория / статистика
          </p>
        </div>

        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 16 }}>Средняя зарплата по уровню роли, ₽</p>
          {salaryChartData.length > 0 && (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={salaryChartData} margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="salary" name="Зарплата" radius={[6, 6, 0, 0]} maxBarSize={54}>
                  {salaryChartData.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Role archetype cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
            Профили ролей — наборы навыков
          </p>
          {activeComplexity && (
            <button onClick={() => setActiveComplexity(null)}
              style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, background: 'rgba(244,63,94,.1)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.2)', cursor: 'pointer' }}>
              × Сбросить фильтр
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {filteredArchetypes.map(a => {
            const meta = COMPLEXITY_META[a.complexity] ?? {}
            return (
              <div key={a.archetype_id} className="glass" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Role header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
                      {a.archetype_label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30`,
                      }}>{meta.label}</span>
                      {a.math_required && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 11,
                          background: 'rgba(244,63,94,.08)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.2)',
                        }}>📐 Математика</span>
                      )}
                      {meta.vibe_ok && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 11,
                          background: 'rgba(16,185,129,.08)', color: '#10B981', border: '1px solid rgba(16,185,129,.2)',
                        }}>⚡ Vibe OK</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#10B981', letterSpacing: '-0.03em' }}>
                      {a.avg_salary ? (a.avg_salary / 1000).toFixed(0) + 'k ₽' : '—'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.count} вак. · {a.avg_experience}л опыта</p>
                  </div>
                </div>

                {/* Skill bundle */}
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 7 }}>
                    Типичный набор навыков
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {a.top_skills.map((s, i) => (
                      <span key={s} style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: i < 3 ? 600 : 400,
                        background: i < 3 ? `${meta.color}15` : 'rgba(255,255,255,.04)',
                        color: i < 3 ? meta.color : '#94A3B8',
                        border: `1px solid ${i < 3 ? meta.color + '30' : 'rgba(255,255,255,.07)'}`,
                      }}>{s}</span>
                    ))}
                  </div>
                  {a.top_skills.length >= 3 && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                      <span style={{ color: meta.color }}>Ядро</span>: первые 3 навыка — в большинстве вакансий этой роли
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Co-occurrence table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Топ-25 пар навыков в одной вакансии</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Как часто два навыка встречаются вместе — показывает реальные стековые связки
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Навык A', 'Навык B', 'Встреч', 'Доля вакансий'].map(h => (
                  <th key={h} style={{
                    padding: '11px 18px',
                    textAlign: ['Встреч', 'Доля вакансий', '#'].includes(h) ? 'right' : 'left',
                    fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {combinations.map((c, i) => {
                const barWidth = combinations[0] ? Math.round(c.percentage / combinations[0].percentage * 100) : 0
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--text-3)', fontSize: 11, width: 36 }}>{i + 1}</td>
                    <td style={{ padding: '10px 18px' }}>
                      <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 12, background: 'rgba(34,211,238,.08)', color: '#22D3EE', border: '1px solid rgba(34,211,238,.2)' }}>
                        {c.skills[0]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 18px' }}>
                      <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 12, background: 'rgba(129,140,248,.08)', color: '#818CF8', border: '1px solid rgba(129,140,248,.2)' }}>
                        {c.skills[1]}
                      </span>
                    </td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{c.count}</td>
                    <td style={{ padding: '10px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                        <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${barWidth}%`, height: '100%', background: 'linear-gradient(90deg,#22D3EE,#818CF8)', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
