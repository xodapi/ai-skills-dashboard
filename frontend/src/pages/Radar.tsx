import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

// Thoughtworks radar: 4 quadrants × 4 rings
const QUADRANTS = ['AI Frameworks', 'Infrastructure', 'Data & ML', 'Languages']
const RINGS = [
  { name: 'Adopt', radius: 0.25, color: '#10B981', desc: 'Горячий спрос, используй сейчас' },
  { name: 'Trial', radius: 0.5, color: '#22D3EE', desc: 'Высокий спрос, пора пробовать' },
  { name: 'Assess', radius: 0.75, color: '#818CF8', desc: 'Средний спрос, следи за трендом' },
  { name: 'Hold', radius: 1, color: '#64748B', desc: 'Низкий спрос, устаревает' },
]

interface Skill {
  skill_name: string
  demand: number
  tier: string
  category?: string
}

interface BlipPosition {
  x: number
  y: number
  quadrant: number
  ring: number
}

const CATEGORY_MAP: Record<string, number> = {
  'AI Frameworks': 0,
  'Infrastructure': 1,
  'Data & ML': 2,
  'Languages': 3,
}

// Map skill to category heuristic
function categorizeSkill(name: string): number {
  const n = name.toLowerCase()
  if (/pytorch|tensorflow|keras|sklearn|huggingface|transformers|langchain/.test(n)) return 0
  if (/docker|kubernetes|aws|azure|gcp|terraform|nginx|fastapi|flask/.test(n)) return 1
  if (/pandas|numpy|sql|postgres|mongodb|spark|airflow|mlflow/.test(n)) return 2
  if (/python|javascript|typescript|java|c\+\+|rust|go/.test(n)) return 3
  return 0 // default
}

// Map tier to ring
function tierToRing(tier: string): number {
  if (tier === 'hot') return 0
  if (tier === 'high') return 1
  if (tier === 'medium') return 2
  return 3
}

// Generate blip position in polar coords
function generateBlipPosition(skill: Skill, index: number, totalInSegment: number): BlipPosition {
  const quadrant = skill.category ? (CATEGORY_MAP[skill.category] ?? categorizeSkill(skill.skill_name)) : categorizeSkill(skill.skill_name)
  const ring = tierToRing(skill.tier)
  
  const innerR = ring === 0 ? 0 : RINGS[ring - 1].radius
  const outerR = RINGS[ring].radius
  const r = innerR + (outerR - innerR) * (0.3 + Math.random() * 0.5)
  
  // Angle within quadrant
  const quadrantStart = (quadrant * Math.PI) / 2
  const quadrantEnd = ((quadrant + 1) * Math.PI) / 2
  const angle = quadrantStart + (quadrantEnd - quadrantStart) * (0.15 + (index / totalInSegment) * 0.7)
  
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle),
    quadrant,
    ring,
  }
}

export function Radar() {
  const [selectedBlip, setSelectedBlip] = useState<Skill | null>(null)
  const [hoveredBlip, setHoveredBlip] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => fetch(`${API}/skills`).then(r => r.json()),
  })

  const skills: Skill[] = data?.skills ?? []
  
  const blips = useMemo(() => {
    const bySegment: Record<string, Skill[]> = {}
    skills.forEach(s => {
      const q = categorizeSkill(s.skill_name)
      const r = tierToRing(s.tier)
      const key = `${q}-${r}`
      if (!bySegment[key]) bySegment[key] = []
      bySegment[key].push(s)
    })
    
    return skills.map(s => {
      const q = categorizeSkill(s.skill_name)
      const r = tierToRing(s.tier)
      const key = `${q}-${r}`
      const idx = bySegment[key].indexOf(s)
      return { skill: s, pos: generateBlipPosition(s, idx, bySegment[key].length) }
    })
  }, [skills])

  const size = 600
  const center = size / 2

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">Technology Radar</span>
          <span className="tag" style={{ background: 'rgba(34,211,238,.08)', color: '#22D3EE', borderColor: 'rgba(34,211,238,.2)' }}>
            {skills.length} навыков
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #22D3EE, #818CF8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Радар технологий
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 680, lineHeight: 1.7 }}>
          Thoughtworks-style радар: 4 квадранта по категориям × 4 кольца по уровню спроса. Кликните на точку для деталей.
        </p>
      </section>

      {isLoading ? (
        <div className="glass" style={{ padding: 80, textAlign: 'center', color: 'var(--text-3)' }}>
          Строим радар...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          
          {/* SVG Radar */}
          <div className="glass" style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ overflow: 'visible' }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <g transform={`translate(${center},${center})`}>
                
                {/* Rings */}
                {RINGS.map((ring, i) => (
                  <circle key={i}
                    cx={0} cy={0}
                    r={ring.radius * (size / 2 - 20)}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.15}
                  />
                ))}
                
                {/* Quadrant lines */}
                {[0, 1, 2, 3].map(q => {
                  const angle = (q * Math.PI) / 2
                  const x = Math.cos(angle) * (size / 2 - 10)
                  const y = Math.sin(angle) * (size / 2 - 10)
                  return (
                    <line key={q}
                      x1={0} y1={0} x2={x} y2={y}
                      stroke="rgba(255,255,255,.08)"
                      strokeWidth={1}
                    />
                  )
                })}
                
                {/* Blips */}
                {blips.map(({ skill, pos }, i) => {
                  const x = pos.x * (size / 2 - 20)
                  const y = pos.y * (size / 2 - 20)
                  const color = RINGS[pos.ring].color
                  const isHovered = hoveredBlip === skill.skill_name
                  const isSelected = selectedBlip?.skill_name === skill.skill_name
                  const r = isHovered || isSelected ? 8 : 5
                  
                  return (
                    <g key={i}
                      onMouseEnter={() => setHoveredBlip(skill.skill_name)}
                      onMouseLeave={() => setHoveredBlip(null)}
                      onClick={() => setSelectedBlip(skill)}
                      style={{ cursor: 'pointer' }}>
                      <circle
                        cx={x} cy={y} r={r}
                        fill={color}
                        fillOpacity={isHovered || isSelected ? 1 : 0.7}
                        stroke={color}
                        strokeWidth={isHovered || isSelected ? 2 : 0}
                        filter={isHovered || isSelected ? 'url(#glow)' : undefined}
                        style={{ transition: 'all .2s' }}
                      />
                      {(isHovered || isSelected) && (
                        <text
                          x={x} y={y - 14}
                          textAnchor="middle"
                          fill="#F1F5F9"
                          fontSize={11}
                          fontWeight={600}
                          style={{ pointerEvents: 'none' }}>
                          {skill.skill_name}
                        </text>
                      )}
                    </g>
                  )
                })}
                
                {/* Quadrant labels */}
                {QUADRANTS.map((label, i) => {
                  const angle = (i * Math.PI) / 2 + Math.PI / 4
                  const x = Math.cos(angle) * (size / 2 - 60)
                  const y = Math.sin(angle) * (size / 2 - 60)
                  return (
                    <text key={i}
                      x={x} y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--text-1)"
                      fontSize={14}
                      fontWeight={700}
                      style={{ textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {label}
                    </text>
                  )
                })}
              </g>
            </svg>
          </div>
          
          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Legend */}
            <div className="glass" style={{ padding: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Глоссарий: кольца радара</p>
              {RINGS.map(ring => (
                <div key={ring.name} style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: ring.color, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: ring.color, marginBottom: 3 }}>{ring.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{ring.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Selected blip details */}
            {selectedBlip ? (
              <div className="glass" style={{ padding: 20, border: '1px solid rgba(34,211,238,.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9' }}>{selectedBlip.skill_name}</h3>
                  <button onClick={() => setSelectedBlip(null)}
                    style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.2)', borderRadius: 6, padding: '3px 8px', color: '#F43F5E', cursor: 'pointer', fontSize: 11 }}>
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '10px 12px', background: 'rgba(34,211,238,.08)', borderRadius: 8, border: '1px solid rgba(34,211,238,.2)' }}>
                    <p style={{ fontSize: 10, color: '#22D3EE', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Спрос</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#22D3EE' }}>{selectedBlip.demand}%</p>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'rgba(129,140,248,.08)', borderRadius: 8, border: '1px solid rgba(129,140,248,.2)' }}>
                    <p style={{ fontSize: 10, color: '#818CF8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Категория</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#818CF8' }}>{QUADRANTS[categorizeSkill(selectedBlip.skill_name)]}</p>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,.2)' }}>
                    <p style={{ fontSize: 10, color: '#10B981', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.05em' }}>Рекомендация</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>{RINGS[tierToRing(selectedBlip.tier)].name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass" style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                Кликните на точку для просмотра деталей
              </div>
            )}
            
            {/* Quadrant stats */}
            <div className="glass" style={{ padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>По квадрантам</p>
              {QUADRANTS.map((q, i) => {
                const count = blips.filter(b => b.pos.quadrant === i).length
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < QUADRANTS.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{q}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22D3EE' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
