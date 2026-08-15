import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts'

const API = '/api/v1'
const COLORS = ['#22D3EE', '#10B981', '#818CF8', '#F59E0B', '#F43F5E']

const SKILL_PRESETS = [
  { name: 'Python', color: COLORS[0] },
  { name: 'PyTorch', color: COLORS[1] },
  { name: 'LLM', color: COLORS[2] },
  { name: 'Kubernetes', color: COLORS[3] },
  { name: 'MLOps', color: COLORS[4] },
  { name: 'Deep Learning', color: '#60A5FA' },
  { name: 'Docker', color: '#A78BFA' },
  { name: 'FastAPI', color: '#34D399' },
  { name: 'Machine Learning', color: '#FB923C' },
  { name: 'TensorFlow', color: '#4ADE80' },
]

const PERIODS = [
  { label: '7 дней', value: '7d' },
  { label: '30 дней', value: '30d' },
  { label: '90 дней', value: '90d' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(8,12,20,.97)', border: '1px solid rgba(34,211,238,.2)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#475569', marginBottom: 8, fontSize: 11 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.dataKey}: <strong style={{ color: '#F1F5F9' }}>{p.value} вак.</strong>
        </p>
      ))}
    </div>
  )
}

export function Trends() {
  const [selected, setSelected] = useState<string[]>(['Python', 'LLM', 'MLOps'])
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const queries = selected.map(skill =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['trend', skill, period],
      queryFn: () => fetch(`${API}/trends?skill=${encodeURIComponent(skill)}&period=${period}`).then(r => r.json()),
    })
  )

  const allDates = new Set<string>()
  queries.forEach(q => q.data?.data_points?.forEach((p: any) => allDates.add(p.date)))

  const chartData = Array.from(allDates).sort().map(date => {
    const row: any = { date: date.slice(5) }
    queries.forEach((q, i) => {
      const pt = q.data?.data_points?.find((p: any) => p.date === date)
      row[selected[i]] = pt?.count ?? 0
    })
    return row
  })

  const toggle = (skill: string) =>
    setSelected(prev => prev.includes(skill)
      ? prev.filter(s => s !== skill)
      : [...prev, skill].slice(-5))

  const maxVal = Math.max(...chartData.flatMap(d => selected.map(s => d[s] ?? 0)), 1)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Временны́е ряды</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>до 5 навыков</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #818CF8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Тренды навыков
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Сравните динамику спроса на до 5 навыков за выбранный период
        </p>
      </section>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Period */}
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value as any)}
              style={{
                padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: period === p.value ? 'rgba(34,211,238,.15)' : 'transparent',
                color: period === p.value ? '#22D3EE' : '#475569',
                border: period === p.value ? '1px solid rgba(34,211,238,.3)' : '1px solid rgba(255,255,255,.06)',
                transition: 'all .2s',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Skills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SKILL_PRESETS.map((s, i) => {
            const on = selected.includes(s.name)
            const color = COLORS[selected.indexOf(s.name)] ?? s.color
            return (
              <button key={s.name} onClick={() => toggle(s.name)}
                style={{
                  padding: '6px 13px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: on ? `${color}15` : 'transparent',
                  color: on ? color : '#475569',
                  border: on ? `1px solid ${color}40` : '1px solid rgba(255,255,255,.06)',
                  transition: 'all .2s',
                }}>
                {on && <span style={{ marginRight: 4, fontSize: 8 }}>●</span>}
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main chart */}
      <div className="glass" style={{ padding: 28 }}>
        {chartData.length === 0 ? (
          <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
            Загрузка данных…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: -10 }}>
              <defs>
                {selected.map((s, i) => (
                  <filter key={s} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, maxVal * 1.1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8', paddingTop: 16 }} />
              {selected.map((skill, i) => (
                <Line
                  key={skill}
                  type="monotone"
                  dataKey={skill}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: COLORS[i % COLORS.length], filter: `url(#glow-${i})` }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini cards per skill */}
      {selected.length > 0 && chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {selected.map((skill, i) => {
            const vals = chartData.map(d => d[skill] ?? 0)
            const last = vals[vals.length - 1] ?? 0
            const prev = vals[Math.max(0, vals.length - 2)] ?? 0
            const delta = prev > 0 ? ((last - prev) / prev * 100).toFixed(1) : null
            const trend = delta ? (parseFloat(delta) >= 0 ? '↑' : '↓') : '–'
            const trendColor = delta ? (parseFloat(delta) >= 0 ? '#10B981' : '#F43F5E') : '#475569'
            return (
              <div key={skill} className="glass" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{skill}</p>
                  <span style={{ fontSize: 11, color: COLORS[i % COLORS.length], background: `${COLORS[i % COLORS.length]}15`, padding: '2px 6px', borderRadius: 99 }}>
                    #{i + 1}
                  </span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: COLORS[i % COLORS.length], letterSpacing: '-0.03em', marginTop: 6 }}>
                  {last}
                </p>
                <p style={{ fontSize: 11, color: trendColor, marginTop: 4 }}>
                  {trend} {delta ? `${Math.abs(parseFloat(delta))}% к пред. дню` : 'нет данных'}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
