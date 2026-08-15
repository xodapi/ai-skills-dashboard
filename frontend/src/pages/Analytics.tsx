import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const API = '/api/v1'
const COLORS = ['#22D3EE','#10B981','#818CF8','#F59E0B','#F43F5E','#34D399','#A78BFA','#FB923C','#60A5FA','#4ADE80',
                 '#E879F9','#2DD4BF','#FCD34D','#86EFAC','#C084FC']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(8,12,20,.97)', border: '1px solid rgba(34,211,238,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: '#22D3EE', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: '#94A3B8', marginBottom: 2 }}>
          {p.name}: <strong style={{ color: '#F1F5F9' }}>{typeof p.value === 'number' ? p.value.toLocaleString('ru-RU') : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function Analytics() {
  const { data: topSkills } = useQuery({ queryKey: ['topSkills20'], queryFn: () => fetch(`${API}/skills/top?limit=20`).then(r => r.json()) })
  const { data: mapData }   = useQuery({ queryKey: ['mapData'],     queryFn: () => fetch(`${API}/map/vacancies`).then(r => r.json()) })
  const { data: summary }   = useQuery({ queryKey: ['summary'],     queryFn: () => fetch(`${API}/stats/summary`).then(r => r.json()) })

  const skills: any[]   = topSkills?.skills ?? []
  const locations: any[] = mapData?.locations ?? []

  const salaryData = skills.filter(s => s.avg_salary > 0).slice(0, 12)
    .map(s => ({ name: s.skill, salary: s.avg_salary }))
    .sort((a, b) => b.salary - a.salary)

  const radarData = skills.slice(0, 7).map(s => ({
    skill: s.skill, demand: Math.round(s.percentage), salary: Math.round(s.avg_salary / 10000),
  }))

  const topCities = locations.sort((a, b) => b.vacancy_count - a.vacancy_count).slice(0, 8)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="tag">Аналитика рынка</span>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #F59E0B)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Аналитика</h1>
      </section>

      {/* KPI strip */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {[
            { label: 'Вакансий', value: summary.total_vacancies?.toLocaleString('ru-RU'), color: '#22D3EE' },
            { label: 'Навыков', value: summary.total_skills?.toLocaleString('ru-RU'), color: '#10B981' },
            { label: 'Ср. зарплата', value: summary.avg_salary ? summary.avg_salary.toLocaleString('ru-RU') + ' ₽' : '—', color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Two charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Salary bar */}
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20 }}>Средняя зарплата по навыкам, ₽</p>
          {salaryData.length === 0 ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Загрузка…</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 130 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={125} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="salary" name="Зарплата" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {salaryData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Radar */}
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Профиль топ-навыков</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>Спрос (%) и зарплата (×10k ₽)</p>
          {radarData.length === 0 ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Загрузка…</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,.07)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Radar name="Спрос %" dataKey="demand" stroke="#22D3EE" fill="rgba(34,211,238,.15)" strokeWidth={2} />
                <Radar name="Зарплата" dataKey="salary" stroke="#10B981" fill="rgba(16,185,129,.1)" strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cities */}
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20 }}>Вакансии по городам</p>
        {topCities.length === 0 ? (
          <div style={{ color: 'var(--text-3)' }}>Загрузка…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(() => {
              const max = topCities[0]?.vacancy_count ?? 1
              return topCities.map((city: any, i: number) => {
                const pct = Math.round(city.vacancy_count / max * 100)
                return (
                  <div key={city.city} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
                    <span style={{ width: 22, textAlign: 'right', color: 'var(--text-3)', fontSize: 11 }}>{i + 1}</span>
                    <span style={{ width: 160, color: 'var(--text-1)', fontWeight: 500, flexShrink: 0 }}>{city.city}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 99,
                        background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i+1) % COLORS.length]})`,
                        opacity: .8,
                      }} />
                    </div>
                    <span style={{ width: 60, textAlign: 'right', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums', fontSize: 12, flexShrink: 0 }}>
                      {city.vacancy_count}
                    </span>
                    {city.avg_salary > 0 && (
                      <span style={{ width: 110, textAlign: 'right', color: '#10B981', fontSize: 12, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {city.avg_salary.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )}
      </div>

      {/* Full skills table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Топ-20 навыков — полная таблица</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['#', 'Навык', 'Вакансий', 'Доля рынка', 'Ср. зарплата'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: h === '#' || h === 'Вакансий' || h === 'Доля рынка' || h === 'Ср. зарплата' ? 'right' : 'left',
                    fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skills.map((s: any, i: number) => (
                <tr key={s.skill} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-3)', fontSize: 11, width: 40 }}>{i + 1}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0, boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}80` }} />
                      <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{s.skill}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{s.vacancy_count}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-3)' }}>{s.percentage?.toFixed(1)}%</span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
                    {s.avg_salary ? s.avg_salary.toLocaleString('ru-RU') + ' ₽' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
