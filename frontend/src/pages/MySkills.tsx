import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

const API = '/api/v1'

interface Skill { skill: string; level: number; source: string; updated_at: string }
interface SkillStat { skill: string; vacancy_count: number; avg_salary: number }

const LEVEL_LABELS = [
  { min: 0,  max: 25,  label: 'Beginner',     color: '#94A3B8' },
  { min: 25, max: 50,  label: 'Elementary',   color: '#818CF8' },
  { min: 50, max: 75,  label: 'Intermediate', color: '#22D3EE' },
  { min: 75, max: 90,  label: 'Advanced',     color: '#10B981' },
  { min: 90, max: 101, label: 'Expert',       color: '#F59E0B' },
]
function levelInfo(level: number) {
  return LEVEL_LABELS.find(l => level >= l.min && level < l.max) ?? LEVEL_LABELS[0]
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export function MySkills() {
  const { user, token, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [addSkill, setAddSkill]     = useState('')
  const [addLevel, setAddLevel]     = useState(50)
  const [skillSearch, setSkillSearch] = useState('')
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editLevel, setEditLevel]   = useState(50)

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: mySkills = [], refetch: refetchMine } = useQuery<Skill[]>({
    queryKey: ['user-skills', token],
    queryFn: () => fetch(`${API}/users/me/skills`, { headers: { Authorization: `Bearer ${token!}` } }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: allSkillsData } = useQuery({
    queryKey: ['skills-list-manage'],
    queryFn: () => fetch(`${API}/skills?limit=80`).then(r => r.json()),
    staleTime: 5 * 60_000,
  })
  const allSkills: SkillStat[] = allSkillsData?.items ?? allSkillsData?.skills ?? []

  // ── Mutations ────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (skill: string) =>
      fetch(`${API}/users/me/skills`, {
        method: 'POST',
        headers: authHeaders(token!),
        body: JSON.stringify({ skill, level: addLevel, source: 'manual' }),
      }).then(r => { if (!r.ok) throw new Error('add failed'); return r.json() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-skills'] }); setAddSkill(''); setAddLevel(50) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ skill, level }: { skill: string; level: number }) =>
      fetch(`${API}/users/me/skills/${encodeURIComponent(skill)}`, {
        method: 'PATCH',
        headers: authHeaders(token!),
        body: JSON.stringify({ level }),
      }).then(r => { if (!r.ok) throw new Error('update failed'); return r.json() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-skills'] }); setEditingId(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (skill: string) =>
      fetch(`${API}/users/me/skills/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token!}` },
      }).then(r => { if (!r.ok) throw new Error('delete failed') }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-skills'] }),
  })

  // ── Derived ──────────────────────────────────────────────────────────────────
  const mySkillNames = new Set(mySkills.map(s => s.skill))
  const suggestions = allSkills
    .filter(s => !mySkillNames.has(s.skill))
    .filter(s => !skillSearch || s.skill.toLowerCase().includes(skillSearch.toLowerCase()))
    .slice(0, 15)

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔐</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Нужна авторизация</p>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
          Войдите через GitHub для управления своими навыками
        </p>
        <Link to="/" style={{ padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
          ← На главную
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">My Skills</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', borderColor: 'rgba(16,185,129,.25)' }}>
            Phase 2
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Управление навыками
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Добавляйте, оценивайте и удаляйте навыки — это влияет на расчёт зарплаты и рекомендации.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'start' }}>

        {/* Left: add skill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Manual add */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Добавить навык
            </p>
            <input
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              placeholder="Найти навык…"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '9px 12px',
                background: 'var(--surface-4)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, color: 'var(--text-1)', marginBottom: 8,
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {suggestions.map(s => (
                <button key={s.skill} onClick={() => setAddSkill(s.skill)}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 12,
                    background: addSkill === s.skill ? 'var(--accent-dim)' : 'var(--surface-4)',
                    color: addSkill === s.skill ? 'var(--accent)' : 'var(--text-2)',
                    border: addSkill === s.skill ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}>
                  {s.skill}
                </button>
              ))}
            </div>

            {addSkill && (
              <div style={{ marginBottom: 12, padding: '12px 14px', borderRadius: 8, background: 'var(--surface-4)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{addSkill}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: levelInfo(addLevel).color }}>{levelInfo(addLevel).label}</p>
                </div>
                <input type="range" min={0} max={100} value={addLevel}
                  onChange={e => setAddLevel(+e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                  <span>0</span><span>Уровень {addLevel}</span><span>100</span>
                </div>
              </div>
            )}

            <button
              onClick={() => addSkill && addMutation.mutate(addSkill)}
              disabled={!addSkill || addMutation.isPending}
              style={{
                width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: addSkill ? 'var(--accent)' : 'var(--surface-4)',
                color: addSkill ? '#fff' : 'var(--text-3)',
                border: 'none', cursor: addSkill ? 'pointer' : 'not-allowed',
              }}>
              {addMutation.isPending ? '⏳ Добавляю…' : '+ Добавить'}
            </button>
            {addMutation.isError && (
              <p style={{ fontSize: 11, color: '#F43F5E', marginTop: 6 }}>Ошибка — возможно, навык уже добавлен</p>
            )}
          </div>

          {/* Quick links */}
          <div className="glass" style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>Быстрые действия</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link to="/github-import" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>⬡ Импорт с GitHub →</Link>
              <Link to="/salary-calculator" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>💰 Рассчитать зарплату →</Link>
              <Link to="/gap-analyzer" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>⊕ Gap Analyzer →</Link>
            </div>
          </div>
        </div>

        {/* Right: my skills list */}
        <div className="glass" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Мои навыки ({mySkills.length})
            </p>
            {mySkills.length > 0 && (
              <button onClick={() => refetchMine()}
                style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Обновить
              </button>
            )}
          </div>

          {mySkills.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Пока нет навыков — добавьте из списка слева или импортируйте с GitHub.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {mySkills.map(s => {
                const lbl = levelInfo(s.level)
                const isEditing = editingId === s.skill
                return (
                  <div key={s.skill} style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: isEditing ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--surface-4)',
                    border: isEditing ? '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' : '1px solid transparent',
                    transition: 'all .15s',
                  }}>
                    {isEditing ? (
                      /* Edit mode */
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{s.skill}</p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: levelInfo(editLevel).color }}>{levelInfo(editLevel).label} · {editLevel}</p>
                        </div>
                        <input type="range" min={0} max={100} value={editLevel}
                          onChange={e => setEditLevel(+e.target.value)}
                          style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: 8 }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => updateMutation.mutate({ skill: s.skill, level: editLevel })}
                            disabled={updateMutation.isPending}
                            style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                            {updateMutation.isPending ? '⏳' : '✓ Сохранить'}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{s.skill}</p>
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99,
                              background: `color-mix(in srgb, ${lbl.color} 12%, transparent)`,
                              color: lbl.color, border: `1px solid color-mix(in srgb, ${lbl.color} 25%, transparent)` }}>
                              {lbl.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 4, background: 'var(--surface-3)', borderRadius: 99 }}>
                              <div style={{ height: '100%', borderRadius: 99, width: `${s.level}%`, background: lbl.color, transition: 'width .4s' }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{s.level}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => { setEditingId(s.skill); setEditLevel(s.level) }}
                            style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                            ✎
                          </button>
                          <button onClick={() => deleteMutation.mutate(s.skill)}
                            disabled={deleteMutation.isPending}
                            style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(244,63,94,.08)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.25)', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
