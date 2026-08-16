import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const API = '/api/v1'

const TIERS = [
  { label: 'Горячий', min: 0.75, color: '#22D3EE', bg: 'rgba(34,211,238,.1)' },
  { label: 'Высокий', min: 0.50, color: '#10B981', bg: 'rgba(16,185,129,.1)' },
  { label: 'Средний', min: 0.25, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  { label: 'Низкий',  min: 0,    color: '#475569', bg: 'rgba(71,85,105,.1)' },
]

function getTier(count: number, max: number) {
  const pct = count / max
  return TIERS.find(t => pct >= t.min) ?? TIERS[3]
}

export function SkillsMap() {
  const [search, setSearch] = useState('')
  const [activeTier, setActiveTier] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 40

  const { data, isLoading } = useQuery({
    queryKey: ['skills-all', page],
    queryFn: () => fetch(`${API}/skills?skip=${page * limit}&limit=${limit}`).then(r => r.json()),
  })

  const skills: any[] = data?.skills ?? []
  const total: number = data?.total ?? 0
  const maxCount = Math.max(...skills.map(s => s.vacancy_count), 1)

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.skill.toLowerCase().includes(search.toLowerCase())
    const matchTier = !activeTier || getTier(s.vacancy_count, maxCount).label === activeTier
    return matchSearch && matchTier
  })

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="tag">Карта навыков · {total} уникальных</span>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #10B981)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Карта навыков AI/ML
        </h1>
      </section>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Поиск навыка…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {TIERS.map(t => (
            <button key={t.label} onClick={() => setActiveTier(activeTier === t.label ? null : t.label)}
              style={{
                padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                background: activeTier === t.label ? t.bg : 'transparent',
                color: activeTier === t.label ? t.color : '#475569',
                border: activeTier === t.label ? `1px solid ${t.color}40` : '1px solid rgba(255,255,255,.06)',
                transition: 'all .2s',
              }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: t.color, marginRight: 6 }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills grid */}
      {isLoading ? (
        <div style={{ color: 'var(--text-3)', padding: 40 }}>Загрузка…</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filtered.map((s: any) => {
            const tier = getTier(s.vacancy_count, maxCount)
            const pct = Math.round((s.vacancy_count / maxCount) * 100)
            const fontSize = pct > 70 ? 15 : pct > 40 ? 13 : 11

            return (
              <div key={s.skill}
                style={{
                  position: 'relative',
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: tier.bg,
                  border: `1px solid ${tier.color}25`,
                  cursor: 'default',
                  transition: 'all .2s',
                  minWidth: fontSize === 15 ? 140 : fontSize === 13 ? 110 : 90,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${tier.color}70`
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${tier.color}20`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${tier.color}25`
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                <p style={{ fontSize, fontWeight: 600, color: tier.color, lineHeight: 1.2 }}>{s.skill}</p>
                <div style={{ marginTop: 5, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 99 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: tier.color, borderRadius: 99, opacity: .7 }} />
                </div>
                <p style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{s.vacancy_count} вак.</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!search && !activeTier && total > limit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}
            style={{ opacity: page === 0 ? .4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
            ← Назад
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {page * limit + 1}–{Math.min((page + 1) * limit, total)} из {total}
          </span>
          <button className="btn-ghost" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}
            style={{ opacity: (page + 1) * limit >= total ? .4 : 1, cursor: (page + 1) * limit >= total ? 'not-allowed' : 'pointer' }}>
            Вперёд →
          </button>
        </div>
      )}
    </div>
  )
}
