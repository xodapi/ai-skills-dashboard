import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const API = '/api/v1'

interface SkillImpact {
  skill: string
  salary_delta: number
  pct_increase: number
  vacancy_count: number
}
interface MatchedArchetype {
  archetype_id: string
  archetype_label: string
  skill_overlap: number
  max_overlap: number
  match_pct: number
  avg_salary: number
}
interface CalcResult {
  input: { skills: string[]; experience_years: number; employment_type: string }
  salary: { min: number; median: number; max: number; currency: string }
  confidence: number
  matching_vacancies: number
  skill_impacts: SkillImpact[]
  matched_archetypes: MatchedArchetype[]
}
interface SkillStat { skill: string; vacancy_count: number; percentage: number; avg_salary: number }

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}
function fmtRub(n: number) {
  return `${fmt(n)} ₽`
}

export function SalaryCalculator() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'Machine Learning'])
  const [experience, setExperience] = useState(2)
  const [employment, setEmployment] = useState<'full-time' | 'remote' | 'hybrid'>('full-time')
  const [skillSearch, setSkillSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: skillsData } = useQuery({
    queryKey: ['skills-list'],
    queryFn: () => fetch(`${API}/skills?limit=60`).then(r => r.json()),
  })
  const allSkills: SkillStat[] = skillsData?.items ?? skillsData?.skills ?? []

  const { data: result, isFetching, refetch } = useQuery<CalcResult>({
    queryKey: ['salary-calc', selectedSkills, experience, employment],
    queryFn: () =>
      fetch(
        `${API}/salary/calculate?skills=${encodeURIComponent(selectedSkills.join(','))}&experience_years=${experience}&employment_type=${employment}`,
      ).then(r => r.json()),
    enabled: submitted && selectedSkills.length > 0,
  })

  const filtered = useMemo(() => {
    const q = skillSearch.toLowerCase()
    return allSkills
      .filter(s => !selectedSkills.includes(s.skill))
      .filter(s => !q || s.skill.toLowerCase().includes(q))
      .slice(0, 20)
  }, [allSkills, selectedSkills, skillSearch])

  const toggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    )
    setSubmitted(false)
  }

  const calculate = () => {
    setSubmitted(true)
    refetch()
  }

  const confidenceColor =
    !result ? '#64748B'
    : result.confidence > 0.6 ? '#10B981'
    : result.confidence > 0.3 ? '#F59E0B'
    : '#F43F5E'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Salary Calculator</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,.1)', color: '#10B981', borderColor: 'rgba(16,185,129,.25)' }}>
            Levels.fyi стиль
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Предсказание зарплаты
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 600, lineHeight: 1.7 }}>
          Введите свой набор навыков — получите прогноз зарплаты и увидите, какие навыки добавить для роста дохода.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'start' }}>

        {/* Left: inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selected skills */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Ваши навыки ({selectedSkills.length})
            </p>
            {selectedSkills.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Добавьте навыки из списка ниже</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedSkills.map(s => (
                <button key={s} onClick={() => toggle(s)}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                  {s} <span style={{ opacity: .6, fontSize: 10 }}>✕</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add skills */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <input
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              placeholder="Найти навык…"
              style={{
                width: '100%', background: 'var(--surface-4)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-1)',
                boxSizing: 'border-box', marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {filtered.map(s => (
                <button key={s.skill} onClick={() => toggle(s.skill)}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 12,
                    background: 'var(--surface-4)', color: 'var(--text-2)',
                    border: '1px solid var(--border)', cursor: 'pointer',
                  }}>
                  + {s.skill}
                </button>
              ))}
            </div>
          </div>

          {/* Experience + employment */}
          <div className="glass" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Опыт работы</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{experience} {experience === 1 ? 'год' : experience < 5 ? 'года' : 'лет'}</p>
              </div>
              <input type="range" min={0} max={15} value={experience}
                onChange={e => { setExperience(+e.target.value); setSubmitted(false) }}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                <span>Стажёр</span><span>Мидл</span><span>Сеньор</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>Формат работы</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['full-time', 'remote', 'hybrid'] as const).map(t => (
                  <button key={t} onClick={() => { setEmployment(t); setSubmitted(false) }}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: employment === t ? 'var(--accent-dim)' : 'var(--surface-4)',
                      color: employment === t ? 'var(--accent)' : 'var(--text-3)',
                      border: employment === t ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}>
                    {t === 'full-time' ? 'Офис' : t === 'remote' ? 'Удалёнка' : 'Гибрид'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={selectedSkills.length === 0 || isFetching}
            style={{
              padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: selectedSkills.length === 0 ? 'var(--surface-4)' : 'var(--accent)',
              color: selectedSkills.length === 0 ? 'var(--text-3)' : '#fff',
              border: 'none', cursor: selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all .15s',
            }}>
            {isFetching ? '⏳ Вычисляю…' : '🧮 Рассчитать зарплату'}
          </button>
        </div>

        {/* Right: results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!result && !isFetching && (
            <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>💰</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
                Выберите навыки и нажмите «Рассчитать»
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                Анализ основан на {120} реальных вакансиях
              </p>
            </div>
          )}

          {isFetching && (
            <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Анализирую рынок…</p>
            </div>
          )}

          {result && !isFetching && (
            <>
              {/* Main salary card */}
              <div className="glass" style={{ padding: '24px 26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Прогноз зарплаты</p>
                    <p style={{ fontSize: 42, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                      {fmtRub(result.salary.median)}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                      {fmtRub(result.salary.min)} — {fmtRub(result.salary.max)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Уверенность</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: confidenceColor }}>
                      {Math.round(result.confidence * 100)}%
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {result.matching_vacancies} вакансий
                    </p>
                  </div>
                </div>
                {/* Salary bar */}
                <div style={{ height: 10, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
                  <div style={{
                    flex: '0 0 33%', background: 'var(--surface-5)',
                    borderRadius: '99px 0 0 99px',
                  }} />
                  <div style={{
                    flex: '0 0 34%',
                    background: `linear-gradient(90deg, var(--accent), #10B981)`,
                    boxShadow: '0 0 8px var(--accent)',
                  }} />
                  <div style={{ flex: '0 0 33%', background: 'var(--surface-5)', borderRadius: '0 99px 99px 0' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                  <span>Min: {fmtRub(result.salary.min)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Median: {fmtRub(result.salary.median)}</span>
                  <span>Max: {fmtRub(result.salary.max)}</span>
                </div>
              </div>

              {/* Skill impacts */}
              {result.skill_impacts.length > 0 && (
                <div className="glass" style={{ padding: '20px 22px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Добавь навык → рост зарплаты
                  </p>
                  {result.skill_impacts.slice(0, 7).map(imp => (
                    <div key={imp.skill} style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
                    }}>
                      <button onClick={() => toggle(imp.skill)}
                        style={{
                          fontSize: 12, padding: '4px 10px', borderRadius: 99,
                          background: 'rgba(16,185,129,.1)', color: '#10B981',
                          border: '1px solid rgba(16,185,129,.25)', cursor: 'pointer', fontWeight: 600,
                          flexShrink: 0,
                        }}>
                        + {imp.skill}
                      </button>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: 'linear-gradient(90deg, #10B981, #22D3EE)',
                          width: `${Math.min(imp.pct_increase * 4, 100)}%`,
                        }} />
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#10B981', flexShrink: 0 }}>
                        +{imp.pct_increase}%
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
                        +{fmtRub(imp.salary_delta)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched archetypes */}
              {result.matched_archetypes.length > 0 && (
                <div className="glass" style={{ padding: '20px 22px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Похожие роли
                  </p>
                  {result.matched_archetypes.map(arch => (
                    <div key={arch.archetype_id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{arch.archetype_label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          Совпадение {arch.skill_overlap}/{arch.max_overlap} навыков
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{fmtRub(arch.avg_salary)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <div style={{ width: 40, height: 4, background: 'var(--surface-4)', borderRadius: 99 }}>
                            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, width: `${arch.match_pct}%` }} />
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{arch.match_pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/skillsets" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', marginTop: 10, display: 'block' }}>
                    Подробнее о ролях →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
