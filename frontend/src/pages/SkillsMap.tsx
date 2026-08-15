import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

export function SkillsMap() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['skills', page],
    queryFn: () =>
      fetch(`${API}/skills?skip=${page * limit}&limit=${limit}`).then(r => r.json()),
  })

  const skills: any[] = data?.skills ?? []
  const total: number = data?.total ?? 0

  const filtered = search
    ? skills.filter(s => s.skill.toLowerCase().includes(search.toLowerCase()))
    : skills

  const maxCount = Math.max(...skills.map((s: any) => s.vacancy_count || 0), 1)

  const TIER_COLORS = [
    { min: 0.75, color: '#38BDF8', label: 'Горячий' },
    { min: 0.5, color: '#6EE7B7', label: 'Высокий' },
    { min: 0.25, color: '#FBBF24', label: 'Средний' },
    { min: 0, color: '#6B7280', label: 'Низкий' },
  ]

  function tierColor(count: number) {
    const pct = count / maxCount
    return TIER_COLORS.find(t => pct >= t.min)?.color ?? '#6B7280'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="display-text text-display-md text-accent-primary">
            Карта навыков
          </h1>
          <span className="text-sm text-gray-400">{total} навыков в базе</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          {TIER_COLORS.map(t => (
            <div key={t.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <span className="text-gray-400">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Поиск навыка…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="w-full max-w-sm rounded-lg bg-surface-3 border border-surface-4 px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-primary"
        />

        {/* Skills grid */}
        {isLoading ? (
          <div className="text-gray-500">Загрузка…</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {filtered.map((s: any) => {
              const color = tierColor(s.vacancy_count)
              const pct = Math.round((s.vacancy_count / maxCount) * 100)
              return (
                <div
                  key={s.skill}
                  className="group relative rounded-xl bg-surface-3 border border-surface-4 px-4 py-3 cursor-default hover:border-accent-primary transition-colors"
                  style={{ minWidth: 120 }}
                >
                  <div className="text-sm font-medium text-gray-200">{s.skill}</div>
                  <div className="mt-1 h-1 rounded-full bg-surface-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.vacancy_count} вак.</div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 whitespace-nowrap rounded-lg bg-surface-2 border border-surface-4 px-3 py-2 text-xs text-gray-200 shadow-elevated">
                    <div className="font-semibold text-accent-primary">{s.skill}</div>
                    <div>Вакансий: {s.vacancy_count}</div>
                    {s.avg_salary && <div>Ср. зарплата: {s.avg_salary?.toLocaleString('ru-RU')} ₽</div>}
                    <div>Доля: {s.percentage?.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!search && total > limit && (
          <div className="flex gap-2 items-center pt-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-1.5 rounded-lg bg-surface-3 border border-surface-4 text-sm text-gray-300 disabled:opacity-40 hover:border-accent-primary transition-colors"
            >
              ← Назад
            </button>
            <span className="text-sm text-gray-400">
              {page * limit + 1}–{Math.min((page + 1) * limit, total)} из {total}
            </span>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-1.5 rounded-lg bg-surface-3 border border-surface-4 text-sm text-gray-300 disabled:opacity-40 hover:border-accent-primary transition-colors"
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
