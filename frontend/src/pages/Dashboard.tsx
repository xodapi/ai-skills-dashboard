import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const API = '/api/v1'

function fetchJson(url: string) {
  return fetch(url).then(r => r.json())
}

const ACCENT = '#38BDF8'
const COLORS = [
  '#38BDF8','#0EA5E9','#6EE7B7','#34D399','#818CF8',
  '#A78BFA','#F472B6','#FB923C','#FBBF24','#4ADE80',
]

export function Dashboard() {
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => fetchJson(`${API}/stats/summary`),
  })

  const { data: topSkills } = useQuery({
    queryKey: ['topSkills'],
    queryFn: () => fetchJson(`${API}/skills/top?limit=10`),
  })

  const stats = [
    {
      label: 'Всего вакансий',
      value: summary?.total_vacancies?.toLocaleString('ru-RU') ?? '—',
      change: 'из базы данных',
    },
    {
      label: 'Навыков отслеживается',
      value: summary?.total_skills?.toLocaleString('ru-RU') ?? '—',
      change: 'уникальных',
    },
    {
      label: 'Средняя зарплата',
      value: summary?.avg_salary
        ? summary.avg_salary.toLocaleString('ru-RU') + ' ₽'
        : '—',
      change: 'в месяц',
    },
    {
      label: 'Топ навык',
      value: summary?.top_skills?.[0] ?? '—',
      change: summary?.top_skills?.slice(1, 3).join(', ') ?? '',
    },
  ]

  const chartData = topSkills?.skills?.map((s: any) => ({
    name: s.skill,
    count: s.vacancy_count,
    salary: s.avg_salary,
  })) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Hero */}
        <section className="space-y-3">
          <h1 className="display-text text-display-md text-accent-primary">
            AI Skills Analytics
          </h1>
          <p className="body-text text-lg text-gray-300 max-w-3xl">
            Интерактивный дашборд для мониторинга востребованности навыков AI/ML инженеров
            на основе данных HeadHunter.ru и мировых источников вакансий.
          </p>
        </section>

        {/* Stats cards */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card transition-transform hover:scale-[1.02]"
            >
              <p className="text-xs uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="mt-2 text-heading-lg font-bold text-accent-primary truncate">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500 truncate">{stat.change}</p>
            </div>
          ))}
        </section>

        {/* Bar chart: top skills */}
        <section className="space-y-4">
          <h2 className="text-heading-md font-semibold text-gray-100">
            Топ-10 востребованных навыков
          </h2>
          <div className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card">
            {chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                Загрузка данных…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 4, left: 120 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#D1D5DB', fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                    width={115}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(56,189,248,0.06)' }}
                    contentStyle={{
                      background: '#0F131C',
                      border: '1px solid #1E2636',
                      borderRadius: 8,
                      color: '#E5E7EB',
                      fontSize: 13,
                    }}
                    formatter={(v: number) => [`${v} вакансий`, 'Кол-во']}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Skills with avg salary */}
        <section className="space-y-4">
          <h2 className="text-heading-md font-semibold text-gray-100">
            Средняя зарплата по навыкам
          </h2>
          <div className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card">
            {chartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                Загрузка данных…
              </div>
            ) : (
              <div className="space-y-3">
                {chartData.map((item: any, i: number) => {
                  const maxSalary = Math.max(...chartData.map((d: any) => d.salary || 0))
                  const pct = maxSalary ? Math.round((item.salary / maxSalary) * 100) : 0
                  return (
                    <div key={item.name} className="flex items-center gap-4 text-sm">
                      <div className="w-32 flex-shrink-0 text-gray-300 truncate">{item.name}</div>
                      <div className="flex-1 h-5 bg-surface-4 rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                      <div className="w-28 text-right text-gray-300 flex-shrink-0">
                        {item.salary?.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
