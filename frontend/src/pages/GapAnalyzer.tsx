import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

interface Skill {
  skill_name: string
  demand: number
  tier: string
}

interface Archetype {
  archetype_id: string
  archetype_label: string
  complexity: string
  math_required: boolean
  count: number
  top_skills: string[]
  avg_salary: number
}

interface GapAnalysis {
  archetype: Archetype
  match_percent: number
  missing_skills: string[]
  has_skills: string[]
}

export function GapAnalyzer() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArchetype, setSelectedArchetype] = useState<string>('')

  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: () => fetch(`${API}/skills`).then(r => r.json()),
  })

  const { data: archetypesData } = useQuery({
    queryKey: ['archetypes'],
    queryFn: () => fetch(`${API}/vacancies/archetypes`).then(r => r.json()),
  })

  const skills: Skill[] = skillsData?.skills ?? []
  const archetypes: Archetype[] = archetypesData?.archetypes ?? []

  const filteredSkills = useMemo(() => {
    if (!searchTerm) return skills.slice(0, 30)
    return skills.filter(s => s.skill_name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 30)
  }, [skills, searchTerm])

  const gapAnalysis: GapAnalysis[] = useMemo(() => {
    if (selectedSkills.length === 0) return []
    
    return archetypes.map(arch => {
      const has = arch.top_skills.filter(s => selectedSkills.includes(s))
      const missing = arch.top_skills.filter(s => !selectedSkills.includes(s))
      const match = (has.length / arch.top_skills.length) * 100
      
      return {
        archetype: arch,
        match_percent: Math.round(match),
        missing_skills: missing,
        has_skills: has,
      }
    }).sort((a, b) => b.match_percent - a.match_percent)
  }, [selectedSkills, archetypes])

  const targetArchetype = selectedArchetype ? archetypes.find(a => a.archetype_id === selectedArchetype) : null
  const targetGap = targetArchetype ? gapAnalysis.find(g => g.archetype.archetype_id === selectedArchetype) : null

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Gap Analysis</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.08)', color: '#818CF8', borderColor: 'rgba(129,140,248,.2)' }}>
            {selectedSkills.length} выбрано
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #10B981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Анализ пробелов навыков
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 720, lineHeight: 1.7 }}>
          Выберите свои навыки → увидите совпадение с требованиями ролей → для отсутствующих навыков запустите тренажёр
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left: Skill selector */}
        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
              Ваши навыки ({selectedSkills.length})
            </p>
            <input
              type="text"
              placeholder="🔍 Поиск навыка..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input"
              style={{ width: '100%', marginBottom: 12 }}
            />
          </div>

          {/* Selected skills chips */}
          {selectedSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 12, background: 'rgba(16,185,129,.05)', borderRadius: 10, border: '1px solid rgba(16,185,129,.15)' }}>
              {selectedSkills.map(skill => (
                <button key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: 'rgba(16,185,129,.15)', color: '#10B981', border: '1px solid rgba(16,185,129,.3)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {skill}
                  <span style={{ fontSize: 14 }}>×</span>
                </button>
              ))}
            </div>
          )}

          {/* Available skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            {filteredSkills.map(skill => {
              const isSelected = selectedSkills.includes(skill.skill_name)
              const tierColor = skill.tier === 'hot' ? '#F43F5E' : skill.tier === 'high' ? '#F59E0B' : skill.tier === 'medium' ? '#22D3EE' : '#64748B'
              
              return (
                <button key={skill.skill_name}
                  onClick={() => toggleSkill(skill.skill_name)}
                  style={{
                    padding: '10px 14px', textAlign: 'left', borderRadius: 8,
                    background: isSelected ? 'rgba(16,185,129,.08)' : 'rgba(255,255,255,.02)',
                    border: isSelected ? '1px solid rgba(16,185,129,.3)' : '1px solid rgba(255,255,255,.06)',
                    cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)' }}>
                  <span style={{ fontSize: 13, color: isSelected ? '#10B981' : 'var(--text-1)', fontWeight: isSelected ? 600 : 500 }}>
                    {skill.skill_name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: tierColor, fontWeight: 600 }}>{skill.demand}%</span>
                    {isSelected && <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Gap analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {gapAnalysis.length === 0 ? (
            <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ fontSize: 14 }}>Выберите свои навыки слева</p>
            </div>
          ) : (
            <>
              {/* Role match cards */}
              <div className="glass" style={{ padding: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>
                  Совпадение с ролями
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {gapAnalysis.slice(0, 5).map(gap => {
                    const color = gap.match_percent >= 80 ? '#10B981' : gap.match_percent >= 50 ? '#F59E0B' : '#64748B'
                    const isSelected = selectedArchetype === gap.archetype.archetype_id
                    
                    return (
                      <button key={gap.archetype.archetype_id}
                        onClick={() => setSelectedArchetype(isSelected ? '' : gap.archetype.archetype_id)}
                        style={{
                          padding: '12px 14px', textAlign: 'left', borderRadius: 10,
                          background: isSelected ? 'rgba(34,211,238,.08)' : 'rgba(255,255,255,.02)',
                          border: isSelected ? '1px solid rgba(34,211,238,.3)' : '1px solid rgba(255,255,255,.06)',
                          cursor: 'pointer', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{gap.archetype.archetype_label}</p>
                          <p style={{ fontSize: 16, fontWeight: 800, color }}>{gap.match_percent}%</p>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${gap.match_percent}%`, height: '100%', background: color, borderRadius: 99 }} />
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>
                          {gap.missing_skills.length} навыков отсутствует
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Target role details */}
              {targetGap && (
                <div className="glass" style={{ padding: 20, border: '1px solid rgba(34,211,238,.25)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', marginBottom: 4 }}>{targetGap.archetype.archetype_label}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {targetGap.archetype.count} вакансий · ₽{(targetGap.archetype.avg_salary / 1000).toFixed(0)}k ср.
                    </p>
                  </div>

                  {/* Has skills */}
                  {targetGap.has_skills.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>✓</span> У вас есть ({targetGap.has_skills.length})
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {targetGap.has_skills.map(s => (
                          <span key={s} style={{
                            padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)',
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing skills with trainers */}
                  {targetGap.missing_skills.length > 0 && (
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⚠</span> Нужно изучить ({targetGap.missing_skills.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {targetGap.missing_skills.map(skill => (
                          <div key={skill} style={{
                            padding: '10px 12px', borderRadius: 8,
                            background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.2)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{skill}</span>
                            <button
                              onClick={() => window.open(`/trainer/${encodeURIComponent(skill)}`, '_blank')}
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: 11 }}>
                              🎯 Тренажёр
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
