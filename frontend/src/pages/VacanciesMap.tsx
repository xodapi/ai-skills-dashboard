import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

export function VacanciesMap() {
  const [city, setCity] = useState('')
  const [skill, setSkill] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['vacancies', page, city, skill],
    queryFn: () => {
      const params = new URLSearchParams({
        skip: String(page * limit),
        limit: String(limit),
        ...(city ? { city } : {}),
        ...(skill ? { skill } : {}),
      })
      return fetch(`${API}/vacancies?${params}`).then(r => r.json())
    },
  })

  const items: any[] = data?.items ?? []
  const total: number = data?.total ?? 0

  const CITIES = ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan', 'Yekaterinburg']
  const SKILLS = ['Python', 'PyTorch', 'Machine Learning', 'LLM', 'Kubernetes', 'MLOps']

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="display-text text-display-md text-accent-primary">
            Вакансии
          </h1>
          {total > 0 && (
            <span className="text-sm text-gray-400">{total} вакансий найдено</span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={city}
            onChange={e => { setCity(e.target.value); setPage(0) }}
            className="rounded-lg bg-surface-3 border border-surface-4 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-primary"
          >
            <option value="">Все города</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={skill}
            onChange={e => { setSkill(e.target.value); setPage(0) }}
            className="rounded-lg bg-surface-3 border border-surface-4 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-primary"
          >
            <option value="">Все навыки</option>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(city || skill) && (
            <button
              onClick={() => { setCity(''); setSkill(''); setPage(0) }}
              className="px-3 py-2 rounded-lg bg-surface-3 border border-surface-4 text-sm text-gray-400 hover:text-error transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Vacancies list */}
        {isLoading ? (
          <div className="text-gray-500">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl bg-surface-3 border border-surface-4 p-8 text-center text-gray-500">
            Вакансии не найдены
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((v: any) => (
              <div
                key={v.id}
                className="rounded-xl bg-surface-3 border border-surface-4 px-5 py-4 hover:border-accent-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold text-gray-100">{v.title}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{v.company} · {v.city}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {v.salary_min ? (
                      <div className="text-sm font-medium text-accent-muted">
                        {v.salary_min.toLocaleString('ru-RU')}
                        {v.salary_max ? ` – ${v.salary_max.toLocaleString('ru-RU')}` : '+'} ₽
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">з/п не указана</div>
                    )}
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">{v.employment_type}</div>
                  </div>
                </div>
                {v.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {v.skills.slice(0, 8).map((s: string) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-xs bg-surface-4 text-gray-300 border border-surface-5"
                      >
                        {s}
                      </span>
                    ))}
                    {v.skills.length > 8 && (
                      <span className="text-xs text-gray-500 self-center">+{v.skills.length - 8}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
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
