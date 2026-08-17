import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

const API = '/api/v1'

// ── Types ──────────────────────────────────────────────────────────────────────
interface SkillStat { skill: string; vacancy_count: number; percentage: number; avg_salary: number }
interface Archetype {
  archetype_id: string
  archetype_label: string
  complexity: string
  count: number
  top_skills: string[]
  avg_salary: number
}
interface Vacancy {
  id: number
  title: string
  company: string
  city: string
  salary_min: number | null
  salary_max: number | null
  employment_type: string
  skills: string[]
  url: string
}
interface UserSkill { skill: string; level: number; source: string }

// Trainer exists for these skills
const TRAINABLE = new Set([
  'Python', 'PyTorch', 'Docker', 'Kubernetes', 'LangChain', 'SQL',
  'MLflow', 'scikit-learn', 'Computer Vision', 'Transformers', 'Pandas',
  'FastAPI', 'OpenCV', 'Airflow', 'Terraform',
])

function trainerSlug(skill: string) {
  return encodeURIComponent(skill.toLowerCase())
}

// ── Skill source badge ────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: 'manual' | 'github' | 'vacancy' | string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    github:  { label: '⬡ GitHub', color: '#22D3EE' },
    vacancy: { label: '📋 Вакансия', color: '#818CF8' },
    manual:  { label: '✏ Вручную', color: '#10B981' },
  }
  const c = cfg[source] ?? { label: source, color: '#94A3B8' }
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 99,
      background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
      color: c.color, border: `1px solid color-mix(in srgb, ${c.color} 25%, transparent)`,
      fontWeight: 600,
    }}>
      {c.label}
    </span>
  )
}

// ── Match meter ───────────────────────────────────────────────────────────────
function MatchBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .5s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function GapAnalyzer() {
  const { token, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const { showToast } = useToast()

  // ── Mode: role-based or vacancy-based ─────────────────────────────────────
  const [mode, setMode] = useState<'role' | 'vacancy'>('role')

  // ── My skills (manual + from GitHub) ──────────────────────────────────────
  const [manualSkills, setManualSkills] = useState<string[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [selectedArchetype, setSelectedArchetype] = useState('')
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)

  // ── Data queries ───────────────────────────────────────────────────────────
  const { data: skillsData } = useQuery({
    queryKey: ['skills-list-gap'],
    queryFn: () => fetch(`${API}/skills?limit=80`).then(r => r.json()),
    staleTime: 5 * 60_000,
  })
  const allSkills: SkillStat[] = skillsData?.items ?? skillsData?.skills ?? []

  const { data: archetypesData } = useQuery({
    queryKey: ['archetypes'],
    queryFn: () => fetch(`${API}/vacancies/archetypes`).then(r => r.json()),
    staleTime: 5 * 60_000,
  })
  const archetypes: Archetype[] = archetypesData?.archetypes ?? []

  const { data: vacanciesData } = useQuery({
    queryKey: ['vacancies-gap'],
    queryFn: () => fetch(`${API}/vacancies?limit=30`).then(r => r.json()),
    staleTime: 5 * 60_000,
    enabled: mode === 'vacancy',
  })
  const vacancies: Vacancy[] = vacanciesData?.items ?? []

  const { data: userSkillsRaw } = useQuery<UserSkill[]>({
    queryKey: ['user-skills', token],
    queryFn: () =>
      fetch(`${API}/users/me/skills`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    enabled: !!token,
    staleTime: 60_000,
  })

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (v: Vacancy) =>
      fetch(`${API}/users/me/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ vacancy: { ...v, id: String(v.id) } }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      showToast('success', 'Вакансия сохранена в закладки')
    },
    onError: () => {
      showToast('error', 'Ошибка при сохранении')
    },
  })

  // ── Merge my skills: user profile + manual ────────────────────────────────
  const mySkills: string[] = useMemo(() => {
    const fromProfile = (userSkillsRaw ?? []).map(s => s.skill)
    return Array.from(new Set([...fromProfile, ...manualSkills]))
  }, [userSkillsRaw, manualSkills])

  const toggleManual = (skill: string) =>
    setManualSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )

  // ── Gap analysis against archetypes ──────────────────────────────────────
  const roleGaps = useMemo(() => {
    if (mySkills.length === 0) return []
    return archetypes.map(arch => {
      const has = arch.top_skills.filter(s => mySkills.includes(s))
      const missing = arch.top_skills.filter(s => !mySkills.includes(s))
      return {
        archetype: arch,
        match_pct: Math.round((has.length / Math.max(arch.top_skills.length, 1)) * 100),
        missing,
        has,
      }
    }).sort((a, b) => b.match_pct - a.match_pct)
  }, [mySkills, archetypes])

  // ── Gap analysis against selected vacancy ────────────────────────────────
  const vacancyGap = useMemo(() => {
    if (!selectedVacancyId) return null
    const vac = vacancies.find(v => v.id === selectedVacancyId)
    if (!vac) return null
    const has = vac.skills.filter(s => mySkills.includes(s))
    const missing = vac.skills.filter(s => !mySkills.includes(s))
    return { vac, has, missing, match_pct: Math.round((has.length / Math.max(vac.skills.length, 1)) * 100) }
  }, [selectedVacancyId, mySkills, vacancies])

  // ── Aggregate missing skills across all vacancies ─────────────────────────
  const aggregateMissing = useMemo(() => {
    if (mode !== 'vacancy' || vacancies.length === 0 || mySkills.length === 0) return []
    const counts: Record<string, number> = {}
    for (const vac of vacancies) {
      for (const s of vac.skills) {
        if (!mySkills.includes(s)) counts[s] = (counts[s] ?? 0) + 1
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))
  }, [mode, vacancies, mySkills])

  const filteredAllSkills = allSkills
    .filter(s => !skillSearch || s.skill.toLowerCase().includes(skillSearch.toLowerCase()))
    .filter(s => !mySkills.includes(s.skill))
    .slice(0, 18)

  const targetRoleGap = roleGaps.find(g => g.archetype.archetype_id === selectedArchetype)
  const topMissingRole = targetRoleGap?.missing ?? roleGaps[0]?.missing ?? []
  const currentMissingList = mode === 'role' ? topMissingRole : (vacancyGap?.missing ?? aggregateMissing.map(x => x.skill))

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Gap Analyzer</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', borderColor: 'rgba(16,185,129,.25)' }}>
            {mySkills.length} навыков
          </span>
          {isAuthenticated && (
            <span className="tag" style={{ background: 'rgba(34,211,238,.08)', color: '#22D3EE', borderColor: 'rgba(34,211,238,.2)' }}>
              ✓ Профиль загружен
            </span>
          )}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #10B981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Анализ пробелов навыков
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 720, lineHeight: 1.7 }}>
          Сравни свои навыки с требованиями вакансий и ролей — увидь, чего не хватает, и сразу запусти тренажёр.
          {!isAuthenticated && (
            <> Войди через GitHub, чтобы навыки подгружались автоматически. </>
          )}
        </p>
      </section>

      {/* ── Mode switcher ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['role', 'vacancy'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 700,
            background: mode === m ? 'var(--accent)' : 'var(--surface-4)',
            color: mode === m ? '#fff' : 'var(--text-2)',
            border: mode === m ? 'none' : '1px solid var(--border)',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {m === 'role' ? '🎭 По ролям' : '📋 По вакансиям'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left: My skills panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profile skills block */}
          {isAuthenticated && userSkillsRaw && userSkillsRaw.length > 0 && (
            <div className="glass" style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                Навыки профиля
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {userSkillsRaw.map(s => (
                  <span key={s.skill} style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)',
                  }}>
                    {s.skill}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Link to="/my-skills" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Управлять →</Link>
                <Link to="/github-import" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>⬡ GitHub Import →</Link>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="glass" style={{ padding: '16px 18px', border: '1px solid rgba(34,211,238,.2)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>🔐 Авто-загрузка навыков</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 10 }}>
                Войди через GitHub — навыки из репозиториев и профиля подтянутся автоматически.
              </p>
              <Link to="/github-import" style={{
                display: 'inline-block', padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                background: 'var(--accent-dim)', color: 'var(--accent)',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                textDecoration: 'none',
              }}>
                ⬡ Импорт с GitHub →
              </Link>
            </div>
          )}

          {/* Manual skill add */}
          <div className="glass" style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Добавить вручную
            </p>
            <input
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              placeholder="Найти навык…"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '8px 11px',
                background: 'var(--surface-4)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 12, color: 'var(--text-1)', marginBottom: 8,
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {filteredAllSkills.map(s => (
                <button key={s.skill} onClick={() => toggleManual(s.skill)} style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 12,
                  background: 'var(--surface-4)', color: 'var(--text-2)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                }}>
                  + {s.skill}
                </button>
              ))}
            </div>

            {/* Manually added (not from profile) */}
            {manualSkills.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {manualSkills.map(s => (
                  <button key={s} onClick={() => toggleManual(s)} style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: 'rgba(129,140,248,.1)', color: '#818CF8',
                    border: '1px solid rgba(129,140,248,.25)', cursor: 'pointer',
                  }}>
                    {s} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Total count */}
          {mySkills.length > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-4)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
              Итого: <strong style={{ color: 'var(--text-1)' }}>{mySkills.length}</strong> навыков
              {isAuthenticated && <SourceBadge source="github" />}
              {manualSkills.length > 0 && <> + <SourceBadge source="manual" /></>}
            </div>
          )}
        </div>

        {/* ── Right: Gap results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {mySkills.length === 0 ? (
            <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600 }}>Добавь навыки слева</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>или войди через GitHub для авто-загрузки</p>
            </div>
          ) : mode === 'role' ? (
            <RoleMode
              roleGaps={roleGaps}
              selectedArchetype={selectedArchetype}
              onSelectArchetype={setSelectedArchetype}
              targetRoleGap={targetRoleGap}
            />
          ) : (
            <VacancyMode
              vacancies={vacancies}
              selectedVacancyId={selectedVacancyId}
              onSelectVacancy={setSelectedVacancyId}
              vacancyGap={vacancyGap}
              aggregateMissing={aggregateMissing}
              token={token ?? ''}
              onBookmark={bookmarkMutation.mutate}
              isBookmarking={bookmarkMutation.isPending}
            />
          )}

          {/* ── Universal: missing skills training plan ── */}
          {currentMissingList.length > 0 && (
            <MissingSkillsTrainingPlan missing={currentMissingList} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Role mode ──────────────────────────────────────────────────────────────────
interface RoleGap {
  archetype: Archetype
  match_pct: number
  missing: string[]
  has: string[]
}

function RoleMode({ roleGaps, selectedArchetype, onSelectArchetype, targetRoleGap }: {
  roleGaps: RoleGap[]
  selectedArchetype: string
  onSelectArchetype: (id: string) => void
  targetRoleGap: RoleGap | undefined
}) {
  return (
    <>
      <div className="glass" style={{ padding: '18px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, letterSpacing: '-0.01em' }}>
          Совпадение с ролями — кликни, чтобы раскрыть
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roleGaps.map(gap => {
            const active = selectedArchetype === gap.archetype.archetype_id
            return (
              <button key={gap.archetype.archetype_id}
                onClick={() => onSelectArchetype(active ? '' : gap.archetype.archetype_id)}
                style={{
                  padding: '12px 14px', textAlign: 'left', borderRadius: 10,
                  background: active ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--surface-4)',
                  border: active ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all .15s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{gap.archetype.archetype_label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {gap.archetype.count} вакансий · ₽{(gap.archetype.avg_salary / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {active ? '▲' : '▼'}
                  </span>
                </div>
                <MatchBar pct={gap.match_pct} />
                {!active && (
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5 }}>
                    {gap.missing.length > 0
                      ? `Не хватает: ${gap.missing.slice(0, 3).join(', ')}${gap.missing.length > 3 ? ` +${gap.missing.length - 3}` : ''}`
                      : '✓ Все ключевые навыки есть'}
                  </p>
                )}
                {active && targetRoleGap && (
                  <RoleDetail gap={targetRoleGap} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

function RoleDetail({ gap }: { gap: RoleGap }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      {gap.has.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>✓ Есть ({gap.has.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {gap.has.map(s => (
              <span key={s} style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {gap.missing.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 6 }}>⚠ Нужно ({gap.missing.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {gap.missing.map(s => (
              <span key={s} style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, background: 'rgba(245,158,11,.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,.25)' }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Vacancy mode ───────────────────────────────────────────────────────────────
function VacancyMode({ vacancies, selectedVacancyId, onSelectVacancy, vacancyGap, aggregateMissing, token, onBookmark, isBookmarking }: {
  vacancies: Vacancy[]
  selectedVacancyId: number | null
  onSelectVacancy: (id: number | null) => void
  vacancyGap: { vac: Vacancy; has: string[]; missing: string[]; match_pct: number } | null
  aggregateMissing: { skill: string; count: number }[]
  token: string
  onBookmark: (v: Vacancy) => void
  isBookmarking: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Aggregate missing skills bar */}
      {aggregateMissing.length > 0 && !selectedVacancyId && (
        <div className="glass" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14 }}>
            Топ недостающих навыков — по всем вакансиям
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {aggregateMissing.map(({ skill, count }, i) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 18, color: 'var(--text-3)', fontSize: 10 }}>#{i + 1}</span>
                <span style={{ flex: 1, color: 'var(--text-1)', fontWeight: 600 }}>{skill}</span>
                <div style={{ width: 80, height: 4, background: 'var(--surface-4)', borderRadius: 99 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: '#F59E0B', width: `${Math.min(count / aggregateMissing[0].count * 100, 100)}%` }} />
                </div>
                <span style={{ color: 'var(--text-3)', minWidth: 50, textAlign: 'right' }}>{count} вак.</span>
                {TRAINABLE.has(skill) && (
                  <Link to={`/trainer/${trainerSlug(skill)}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(34,211,238,.1)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,.2)', textDecoration: 'none', fontWeight: 700 }}>
                    Учить
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vacancy list */}
      <div className="glass" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {selectedVacancyId ? 'Детали вакансии' : 'Выбери вакансию для анализа'}
          </p>
          {selectedVacancyId && (
            <button onClick={() => onSelectVacancy(null)} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              ← Все вакансии
            </button>
          )}
        </div>

        {selectedVacancyId && vacancyGap ? (
          <VacancyGapDetail gap={vacancyGap} onBookmark={onBookmark} isBookmarking={isBookmarking} token={token} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vacancies.map(vac => {
              const hasCount = vac.skills.filter(s => s).length
              return (
                <button key={vac.id} onClick={() => onSelectVacancy(vac.id)} style={{
                  padding: '12px 14px', textAlign: 'left', borderRadius: 10,
                  background: 'var(--surface-4)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'border-color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 30%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vac.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{vac.company} · {vac.city}</p>
                    </div>
                    {vac.salary_min && (
                      <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginLeft: 8, flexShrink: 0 }}>
                        {(vac.salary_min / 1000).toFixed(0)}–{((vac.salary_max ?? vac.salary_min) / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                  {hasCount > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7 }}>
                      {vac.skills.slice(0, 5).map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--surface-3)', color: 'var(--text-2)' }}>{s}</span>
                      ))}
                      {vac.skills.length > 5 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{vac.skills.length - 5}</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function VacancyGapDetail({ gap, onBookmark, isBookmarking, token }: {
  gap: { vac: Vacancy; has: string[]; missing: string[]; match_pct: number }
  onBookmark: (v: Vacancy) => void
  isBookmarking: boolean
  token: string
}) {
  const { vac, has, missing, match_pct } = gap
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>{vac.title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{vac.company} · {vac.city}</p>
          {vac.salary_min && (
            <p style={{ fontSize: 12, color: '#10B981', fontWeight: 700, marginTop: 4 }}>
              {vac.salary_min.toLocaleString('ru-RU')} – {(vac.salary_max ?? vac.salary_min).toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {token && (
            <button onClick={() => onBookmark(vac)} disabled={isBookmarking} style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: 'rgba(129,140,248,.1)', color: '#818CF8',
              border: '1px solid rgba(129,140,248,.3)', cursor: 'pointer',
            }}>
              {isBookmarking ? '⏳' : '🔖 Сохранить'}
            </button>
          )}
          {vac.url && (
            <a href={vac.url} target="_blank" rel="noreferrer" style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              textDecoration: 'none',
            }}>
              Открыть →
            </a>
          )}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Совпадение с требованиями</p>
        <MatchBar pct={match_pct} />
      </div>

      {has.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', marginBottom: 6 }}>✓ Есть ({has.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {has.map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>⚠ Не хватает ({missing.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {missing.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.2)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600 }}>{s}</span>
                {TRAINABLE.has(s) ? (
                  <Link to={`/trainer/${trainerSlug(s)}`} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', textDecoration: 'none', fontWeight: 700 }}>
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
    </div>
  )
}

// ── Training plan for missing skills ──────────────────────────────────────────
function MissingSkillsTrainingPlan({ missing }: { missing: string[] }) {
  const trainable = missing.filter(s => TRAINABLE.has(s))
  const nonTrainable = missing.filter(s => !TRAINABLE.has(s))
  if (missing.length === 0) return null

  return (
    <div className="glass" style={{ padding: '18px 20px', border: '1px solid rgba(34,211,238,.2)' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>
        🗺 План обучения
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>
        {trainable.length} навыков с тренажёром · {nonTrainable.length} требуют внешних курсов
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trainable.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{s}</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)' }}>Интерактивный тренажёр · практические задания</p>
            </div>
            <Link to={`/trainer/${trainerSlug(s)}`} style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              flexShrink: 0,
            }}>
              Начать →
            </Link>
          </div>
        ))}
        {nonTrainable.length > 0 && (
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Изучить самостоятельно:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {nonTrainable.map(s => (
                <span key={s} style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
