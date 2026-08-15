import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

const API = '/api/v1'

const COLORS = [
  '#38BDF8','#6EE7B7','#F472B6','#FBBF24','#818CF8',
  '#34D399','#FB923C','#A78BFA','#4ADE80','#60A5FA',
]

export function Analytics() {
  const { data: topSkills } = useQuery({
    queryKey: ['topSkills20'],
    queryFn: () => fetch(`${API}/skills/top?limit=20`).then(r => r.json()),
  })

  const { data: mapData } = useQuery({
    queryKey: ['mapData'],
    queryFn: () => fetch(`${API}/map/vacancies`).then(r => r.json()),
  })

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => fetch(`${API}/stats/summary`).then(r => r.json()),
  })

  const skills: any[] = topSkills?.skills ?? []
  const locations: any[] = mapData?.locations ?? []

  // salary range buckets from skills
  const salaryData = skills
    .filter(s => s.avg_salary > 0)
    .slice(0, 10)
    .map(s => ({ name: s.skill, salary: s.avg_salary }))
    .sort((a, b) => b.salary - a.salary)

  // city distribution pie
  const cityData = locations
    .sort((a, b) => b.vacancy_count - a.vacancy_count)
    .slice(0, 8)
    .map(l => ({ name: l.city, value: l.vacancy_count }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <h1 className="display-text text-display-md text-accent-primary">
          Аналитика
        </h1>

        {/* Summary strip */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Всего вакансий', value: summary.total_vacancies?.toLocaleString('ru-RU') },
              { label: 'Уникальных навыков', value: summary.total_skills?.toLocaleString('ru-RU') },
              { label: 'Средняя зарплата', value: summary.avg_salary ? summary.avg_salary.toLocaleString('ru-RU') + ' ₽' : '—' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-surface-3 border border-surface-4 p-5">
                <p className="text-xs uppercase tracking-widest text-gray-400">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-accent-primary">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Salary by skill */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-100">Средняя зарплата по навыкам</h2>
          <div className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card">
            {salaryData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-500">Загрузка…</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={salaryData}
                  layout="vertical"
                  margin={{ top: 4, right: 60, bottom: 4, left: 130 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}к`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#D1D5DB', fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                    width={125}
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
                    formatter={(v: number) => [`${v.toLocaleString('ru-RU')} ₽`, 'Ср. зарплата']}
                  />
                  <Bar dataKey="salary" radius={[0, 4, 4, 0]}>
                    {salaryData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* City distribution */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-100">Вакансии по городам</h2>
          <div className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card">
            {cityData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-500">Загрузка…</div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={cityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {cityData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0F131C',
                        border: '1px solid #1E2636',
                        borderRadius: 8,
                        color: '#E5E7EB',
                        fontSize: 13,
                      }}
                      formatter={(v: number) => [`${v} вакансий`, '']}
                    />
                    <Legend
                      wrapperStyle={{ color: '#9CA3AF', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* Top skills table */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-100">Топ-20 навыков</h2>
          <div className="rounded-xl bg-surface-3 border border-surface-4 overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-4">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-400">Навык</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-gray-400">Вакансий</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-gray-400">Доля</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide text-gray-400">Ср. зарплата</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((s: any, i: number) => (
                  <tr key={s.skill} className="border-b border-surface-4 hover:bg-surface-4/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-gray-200 font-medium">{s.skill}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">{s.vacancy_count}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{s.percentage?.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-accent-muted">
                      {s.avg_salary ? s.avg_salary.toLocaleString('ru-RU') + ' ₽' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
