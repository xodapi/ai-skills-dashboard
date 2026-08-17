import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

interface Bookmark {
  id: string
  title: string
  company: string
  salary_min: number | null
  salary_max: number | null
  location: string
  url: string
  required_skills: string[]
  bookmarked_at: string
}

interface UserSkill { skill: string; level: number }

// Skills with trainers available
const TRAINABLE = new Set([
  'Python', 'PyTorch', 'Docker', 'Kubernetes', 'LangChain', 'SQL',
  'MLflow', 'scikit-learn', 'Computer Vision', 'Transformers', 'Pandas',
  'FastAPI', 'OpenCV', 'Airflow', 'Terraform',
])

function fmtSalary(min: number | null, max: number | null): string {
  if (!min) return '—'
  const lo = `${Math.round(min / 1000)}k`
  const hi = max ? `${Math.round(max / 1000)}k` : lo
  return `${lo}–${hi} ₽`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'только что'
  if (h < 24) return `${h}ч назад`
  return `${Math.floor(h / 24)}д назад`
}

export function Bookmarks() {
  const { token, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const { data: bookmarks = [], isFetching } = useQuery<Bookmark[]>({
    queryKey: ['bookmarks', token],
    queryFn: () =>
      fetch(`${API}/users/me/bookmarks`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    enabled: !!token,
    staleTime: 60_000,
  })

  const { data: mySkillsRaw = [] } = useQuery<UserSkill[]>({
    queryKey: ['user-skills', token],
    queryFn: () =>
      fetch(`${API}/users/me/skills`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    enabled: !!token,
    staleTime: 60_000,
  })
  const mySkillSet = new Set(mySkillsRaw.map(s => s.skill))

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`${API}/users/me/bookmarks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  })

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔐</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Нужна авторизация</p>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
          Войдите через GitHub для сохранения вакансий
        </p>
        <Link to="/" style={{ padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
          ← На главную
        </Link>
      </div>
    )
  }

  const filtered = bookmarks.filter(b =>
    !filter ||
    b.title.toLowerCase().includes(filter.toLowerCase()) ||
    b.company.toLowerCase().includes(filter.toLowerCase()) ||
    b.required_skills.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  )

  // Aggregate missing skills across bookmarks
  const missingCounts: Record<string, number> = {}
  for (const b of bookmarks) {
    for (const s of b.required_skills) {
      if (!mySkillSet.has(s)) missingCounts[s] = (missingCounts[s] ?? 0) + 1
    }
  }
  const topMissing = Object.entries(missingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Bookmarks</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.1)', color: '#818CF8', borderColor: 'rgba(129,140,248,.25)' }}>
            {bookmarks.length} вакансий
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), #818CF8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Сохранённые вакансии
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Вакансии, которые вас заинтересовали — с анализом недостающих навыков и планом обучения.
        </p>
      </section>

      {bookmarks.length > 0 && topMissing.length > 0 && (
        <section className="glass" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14 }}>
            🎯 Топ недостающих навыков — по всем сохранённым вакансиям
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {topMissing.map(([skill, count], i) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 20, color: 'var(--text-3)', fontSize: 10, fontWeight: 700 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-1)' }}>{skill}</span>
                <div style={{ width: 80, height: 4, background: 'var(--surface-4)', borderRadius: 99 }}>
                  <div style={{
                    height: '100%', borderRadius: 99, background: '#F59E0B',
                    width: `${Math.min(count / topMissing[0][1] * 100, 100)}%`,
                  }} />
                </div>
                <span style={{ color: 'var(--text-3)', minWidth: 44, textAlign: 'right' }}>{count} вак.</span>
                {TRAINABLE.has(skill) ? (
                  <Link to={`/trainer/${encodeURIComponent(skill.toLowerCase())}`}
                    style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(34,211,238,.1)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,.2)', textDecoration: 'none', fontWeight: 700 }}>
                    Учить
                  </Link>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 36 }}>—</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <Link to="/gap-analyzer" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Открыть полный анализ пробелов →
            </Link>
          </div>
        </section>
      )}

      {/* Search */}
      {bookmarks.length > 0 && (
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Поиск по названию, компании или навыку…"
          style={{
            padding: '11px 16px', borderRadius: 12, fontSize: 13,
            background: 'var(--surface-4)', border: '1px solid var(--border)',
            color: 'var(--text-1)', width: '100%', boxSizing: 'border-box',
          }}
        />
      )}

      {/* Bookmarks list */}
      {isFetching && bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Загрузка…</div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔖</p>
          {bookmarks.length === 0 ? (
            <>
              <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600, marginBottom: 8 }}>Пока ничего не сохранено</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                Открой вакансию в Gap Analyzer или каталоге — и нажми «Сохранить»
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link to="/gap-analyzer" style={{ padding: '9px 20px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
                  Gap Analyzer →
                </Link>
                <Link to="/vacancies" style={{ padding: '9px 20px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                  Каталог вакансий →
                </Link>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Ничего не найдено по запросу «{filter}»</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => {
            const missing = b.required_skills.filter(s => !mySkillSet.has(s))
            const has = b.required_skills.filter(s => mySkillSet.has(s))
            const matchPct = b.required_skills.length > 0
              ? Math.round((has.length / b.required_skills.length) * 100)
              : null
            const isExpanded = expandedId === b.id

            return (
              <div key={b.id} className="glass" style={{
                padding: '18px 20px',
                border: isExpanded ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                transition: 'border-color .15s',
              }}>
                {/* Card header */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>{b.title}</p>
                      {matchPct !== null && (
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
                          background: matchPct >= 80 ? 'rgba(16,185,129,.1)' : matchPct >= 50 ? 'rgba(245,158,11,.1)' : 'rgba(244,63,94,.1)',
                          color: matchPct >= 80 ? '#10B981' : matchPct >= 50 ? '#F59E0B' : '#F43F5E',
                          border: `1px solid ${matchPct >= 80 ? 'rgba(16,185,129,.25)' : matchPct >= 50 ? 'rgba(245,158,11,.25)' : 'rgba(244,63,94,.25)'}`,
                        }}>
                          {matchPct}% совпадение
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
                      {b.company}{b.location ? ` · ${b.location}` : ''} · {timeAgo(b.bookmarked_at)}
                    </p>
                    {b.salary_min && (
                      <p style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>
                        {fmtSalary(b.salary_min, b.salary_max)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                      {isExpanded ? 'Свернуть' : 'Анализ'}
                    </button>
                    {b.url && (
                      <a href={b.url} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', textDecoration: 'none' }}>
                        Открыть
                      </a>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(b.id)}
                      disabled={deleteMutation.isPending}
                      style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(244,63,94,.08)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.25)', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Skills bar */}
                {b.required_skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                    {b.required_skills.map(s => (
                      <span key={s} style={{
                        fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 600,
                        background: mySkillSet.has(s) ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.08)',
                        color: mySkillSet.has(s) ? '#10B981' : '#F59E0B',
                        border: `1px solid ${mySkillSet.has(s) ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.2)'}`,
                      }}>
                        {mySkillSet.has(s) ? '✓ ' : ''}{s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded analysis */}
                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {has.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>✓ У вас есть ({has.length})</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {has.map(s => (
                            <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)', fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {missing.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>
                          ⚠ Нужно изучить ({missing.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {missing.map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.2)' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{s}</span>
                              {TRAINABLE.has(s) ? (
                                <Link to={`/trainer/${encodeURIComponent(s.toLowerCase())}`} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
                                  🎯 Тренажёр
                                </Link>
                              ) : (
                                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>нет тренажёра</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {missing.length === 0 && b.required_skills.length > 0 && (
                      <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', textAlign: 'center' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>✓ Вы подходите на эту позицию!</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Все требуемые навыки в вашем профиле</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
