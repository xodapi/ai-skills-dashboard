import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts'

const API = '/api/v1'
const COLORS = ['#22D3EE','#10B981','#818CF8','#F59E0B','#F43F5E','#34D399','#A78BFA','#FB923C','#60A5FA','#4ADE80']

function StatCard({ label, value, sub, delay = 0 }: { label: string; value: string; sub: string; delay?: number }) {
  return (
    <div className={`glass animate-in delay-${delay}`} style={{ padding: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
        {label}
      </p>
      <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--cyan)', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>{sub}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {dataKey: string; name: string; value: number | string}[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(8,12,20,.95)', border: '1px solid rgba(34,211,238,.2)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#F1F5F9',
    }}>
      <p style={{ color: '#22D3EE', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('ru-RU') : p.value}</strong></p>
      ))}
    </div>
  )
}

// ── Salary hint widget ────────────────────────────────────────────────────────
function SalaryHintWidget() {
  const { data, isFetching } = useQuery({
    queryKey: ['salary-hint-dash'],
    queryFn: () =>
      fetch(`${API}/salary/calculate?skills=Python,Machine+Learning&experience_years=3&employment_type=remote`)
        .then(r => r.json()),
    staleTime: 10 * 60_000,
  })

  return (
    <div className="glass" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          💰 Зарплата · Python + ML · 3 года
        </p>
        <Link to="/salary-calculator" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Рассчитать свою →</Link>
      </div>
      {isFetching ? (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>…</p>
      ) : data?.salary ? (
        <>
          <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {data.salary.median?.toLocaleString('ru-RU')} ₽
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {data.salary.min?.toLocaleString('ru-RU')} — {data.salary.max?.toLocaleString('ru-RU')} ₽ · {data.matching_vacancies} вакансий
          </p>
          {data.skill_impacts?.slice(0, 3).map((imp: {skill: string; pct_increase: number}) => (
            <div key={imp.skill} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-2)' }}>+ {imp.skill}</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>+{imp.pct_increase}%</span>
            </div>
          ))}
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Нет данных</p>
      )}
    </div>
  )
}

// ── Forecast snapshot widget ──────────────────────────────────────────────────
function ForecastSnapshotWidget() {
  const { data, isFetching } = useQuery({
    queryKey: ['forecast-snapshot-dash'],
    queryFn: () => fetch(`${API}/skills/forecast?horizon=3m&top_n=20`).then(r => r.json()),
    staleTime: 10 * 60_000,
  })

  const rising = data?.items?.filter((i: {trend: string}) => i.trend === 'rising').slice(0, 5) ?? []
  const falling = data?.items?.filter((i: {trend: string}) => i.trend === 'falling').slice(0, 3) ?? []

  return (
    <div className="glass" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          📈 Прогноз спроса · 3 месяца
        </p>
        <Link to="/forecast" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Все навыки →</Link>
      </div>
      {isFetching ? (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>…</p>
      ) : (
        <>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#10B981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>↑ Растут</p>
            {rising.map((s: {skill: string; forecast_growth_pct: number}) => (
              <div key={s.skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>{s.skill}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 50, height: 4, background: 'var(--surface-4)', borderRadius: 99 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#10B981', width: `${Math.min(s.forecast_growth_pct * 5, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>+{s.forecast_growth_pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
          {falling.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#F43F5E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>↓ Падают</p>
              {falling.map((s: {skill: string; forecast_growth_pct: number}) => (
                <div key={s.skill} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.skill}</span>
                  <span style={{ fontSize: 11, color: '#F43F5E', fontWeight: 700 }}>{s.forecast_growth_pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}


export function Dashboard() {
  const { data: summary } = useQuery({ queryKey: ['summary'], queryFn: () => fetch(`${API}/stats/summary`).then(r => r.json()) })
  const { data: topSkills } = useQuery({ queryKey: ['topSkills'], queryFn: () => fetch(`${API}/skills/top?limit=10`).then(r => r.json()) })
  const { data: trends } = useQuery({ queryKey: ['trendPython'], queryFn: () => fetch(`${API}/trends?skill=Python&period=30d`).then(r => r.json()) })

  const chartData = topSkills?.skills?.map((s: any) => ({ name: s.skill, count: s.vacancy_count, salary: s.avg_salary })) ?? []
  const trendData = trends?.data_points?.map((p: any) => ({ date: p.date?.slice(5), count: p.count })) ?? []

  const maxSalary = Math.max(...chartData.map((d: any) => d.salary || 0))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* Hero */}
      <section className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">AI/ML Market · 2026</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>
            🇷🇺 Россия + Мир
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1.05,
          background: 'linear-gradient(135deg, #F1F5F9 0%, #22D3EE 50%, #818CF8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          AI Skills Analytics
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 580, lineHeight: 1.6 }}>
          Мониторинг востребованности навыков AI/ML инженеров в реальном времени — на основе тысяч вакансий с HH.ru и мировых источников.
        </p>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
        <StatCard delay={1} label="Вакансий в базе" value={summary?.total_vacancies?.toLocaleString('ru-RU') ?? '—'} sub="обновляется ежедневно" />
        <StatCard delay={2} label="Уникальных навыков" value={summary?.total_skills?.toLocaleString('ru-RU') ?? '—'} sub="AI/ML стек" />
        <StatCard delay={3} label="Средняя зарплата" value={summary?.avg_salary ? summary.avg_salary.toLocaleString('ru-RU') + ' ₽' : '—'} sub="по рынку в месяц" />
        <StatCard delay={4} label="Топ навык" value={summary?.top_skills?.[0] ?? '—'} sub={summary?.top_skills?.slice(1, 3).join(' · ') ?? ''} />
      </section>

      {/* Charts row */}
      <section style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Top skills bar */}
        <div className="glass animate-in delay-1" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20, letterSpacing: '-0.01em' }}>
            Топ-10 навыков по числу вакансий
          </p>
          {chartData.length === 0 ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Загрузка…</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 110 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={105} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Вакансий" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {chartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Python trend area */}
        <div className="glass animate-in delay-2" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4, letterSpacing: '-0.01em' }}>
            Тренд Python · 30 дней
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 20 }}>число вакансий в день</p>
          {trendData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Загрузка…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Вакансий" stroke="#22D3EE" strokeWidth={2} fill="url(#cyan-grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Salary bars */}
      <section className="glass animate-in" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 20, letterSpacing: '-0.01em' }}>
          Средняя зарплата по навыкам
        </p>
        {chartData.length === 0 ? (
          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Загрузка…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chartData.map((item: { name: string; salary: number }, i: number) => {
              const pct = maxSalary ? Math.round((item.salary / maxSalary) * 100) : 0
              return (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                  <div style={{ width: 110, color: 'var(--text-2)', flexShrink: 0, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                      boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}55`,
                      transition: 'width .6s ease',
                    }} />
                  </div>
                  <div style={{ width: 110, textAlign: 'right', color: 'var(--text-1)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {item.salary?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* New feature widgets row */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SalaryHintWidget />
        <ForecastSnapshotWidget />
      </section>

      {/* Feature CTA row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { href: '/salary-calculator', icon: '💰', label: 'Зарплата',  desc: 'Рассчитай по навыкам' },
          { href: '/roadmap',           icon: '🗺️', label: 'Roadmap',   desc: '8 ролей · шаги обучения' },
          { href: '/assessment',        icon: '🧠', label: 'Skill IQ',  desc: 'Адаптивный тест' },
          { href: '/forecast',          icon: '📈', label: 'Прогноз',   desc: 'Спрос на 12 месяцев' },
        ].map(f => (
          <Link key={f.href} to={f.href} style={{ textDecoration: 'none' }}>
            <div className="glass" style={{ padding: '16px 18px', borderRadius: 14, transition: 'border-color .15s', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 35%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <p style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{f.label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{f.desc}</p>
            </div>
          </Link>
        ))}
      </section>

    </div>
  )
}
