import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

const API = '/api/v1'

const SKILLS_PRESETS = [
  'Python', 'PyTorch', 'TensorFlow', 'Kubernetes', 'MLOps',
  'LLM', 'Deep Learning', 'Machine Learning', 'Docker', 'FastAPI',
]

const COLORS = ['#38BDF8', '#6EE7B7', '#F472B6', '#FBBF24', '#818CF8']

export function Trends() {
  const [selected, setSelected] = useState<string[]>(['Python', 'PyTorch', 'LLM'])
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const queries = selected.map(skill =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['trend', skill, period],
      queryFn: () =>
        fetch(`${API}/trends?skill=${encodeURIComponent(skill)}&period=${period}`)
          .then(r => r.json()),
      enabled: selected.includes(skill),
    })
  )

  // Merge all trend data into one array keyed by date
  const allDates: Set<string> = new Set()
  queries.forEach(q => {
    if (q.data?.data_points) {
      q.data.data_points.forEach((p: any) => allDates.add(p.date))
    }
  })

  const chartData = Array.from(allDates).sort().map(date => {
    const row: Record<string, any> = { date }
    queries.forEach((q, i) => {
      const point = q.data?.data_points?.find((p: any) => p.date === date)
      row[selected[i]] = point?.count ?? 0
    })
    return row
  })

  const toggle = (skill: string) => {
    setSelected(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill].slice(-5)
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <h1 className="display-text text-display-md text-accent-primary">
          Тренды навыков
        </h1>

        {/* Period selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-accent-primary text-surface-1'
                  : 'bg-surface-3 border border-surface-4 text-gray-300 hover:text-accent-primary'
              }`}
            >
              {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}
            </button>
          ))}
        </div>

        {/* Skill pills */}
        <div className="flex flex-wrap gap-2">
          {SKILLS_PRESETS.map(skill => (
            <button
              key={skill}
              onClick={() => toggle(skill)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                selected.includes(skill)
                  ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                  : 'bg-surface-3 border-surface-4 text-gray-400 hover:border-accent-primary hover:text-accent-primary'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl bg-surface-3 border border-surface-4 p-6 shadow-card">
          {chartData.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-gray-500">
              Загрузка данных…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2636" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F131C',
                    border: '1px solid #1E2636',
                    borderRadius: 8,
                    color: '#E5E7EB',
                    fontSize: 13,
                  }}
                  formatter={(v: number, name: string) => [`${v} вакансий`, name]}
                />
                <Legend
                  wrapperStyle={{ color: '#9CA3AF', fontSize: 13, paddingTop: 16 }}
                />
                {selected.map((skill, i) => (
                  <Line
                    key={skill}
                    type="monotone"
                    dataKey={skill}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Выберите до 5 навыков для сравнения динамики по периодам. Данные обновляются в реальном времени.
        </p>
      </div>
    </div>
  )
}
