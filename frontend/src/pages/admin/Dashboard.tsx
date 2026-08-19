import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

interface RankedMetric {
  name: string
  value: number
}

interface AdminStats {
  total_users: number
  active_users_7d: number
  new_users_30d: number
  total_skills: number
  average_skills_per_user: number
  completion_rate: number
  total_vacancies: number
  total_bookmarks: number
  popular_skills: RankedMetric[]
  popular_modules: RankedMetric[]
  top_locations: RankedMetric[]
  top_bookmarked_vacancies: RankedMetric[]
}

function MetricCard({ label, value, caption, color = 'var(--accent)' }: {
  label: string
  value: string | number
  caption: string
  color?: string
}) {
  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <p style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
      <p style={{ color, fontSize: 29, fontWeight: 900, letterSpacing: '-.04em', marginTop: 8 }}>{value}</p>
      <p style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 6 }}>{caption}</p>
    </div>
  )
}

function Ranking({ title, items, color = 'var(--accent)' }: {
  title: string
  items: RankedMetric[]
  color?: string
}) {
  const max = Math.max(...items.map(item => item.value), 1)
  return (
    <div className="glass" style={{ padding: '20px 22px' }}>
      <p style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 15 }}>{title}</p>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Пока нет данных</p>
      ) : items.map(item => (
        <div key={item.name} style={{ marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, marginBottom: 5 }}>
            <span style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
            <strong style={{ color, flexShrink: 0 }}>{item.value}</strong>
          </div>
          <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-4)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.value / max * 100}%`, background: color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminDashboard() {
  const { token } = useAuth()
  const { data, isLoading, isError } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error('Не удалось загрузить админ-метрики')
      return response.json()
    },
    enabled: !!token,
  })

  if (isLoading) return <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-3)' }}>Загрузка админ-метрик…</div>
  if (isError || !data) return <div style={{ padding: '60px 24px', textAlign: 'center', color: '#FB7185' }}>Не удалось загрузить данные администратора.</div>

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <span className="tag">Admin · Read only</span>
          <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(1.8rem,4vw,2.7rem)', fontWeight: 900, letterSpacing: '-.04em', marginTop: 10 }}>Панель администратора</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 8 }}>Метрики платформы и данные пользователей, без операций изменения.</p>
        </div>
        <Link to="/admin/users" style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
          Пользователи →
        </Link>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 12 }}>
        <MetricCard label="Пользователи" value={data.total_users} caption={`${data.active_users_7d} активны за 7 дней`} />
        <MetricCard label="Новые" value={data.new_users_30d} caption="за последние 30 дней" color="#34D399" />
        <MetricCard label="Навыки" value={data.total_skills} caption={`в среднем ${data.average_skills_per_user} на пользователя`} color="#A78BFA" />
        <MetricCard label="Завершения" value={`${data.completion_rate}%`} caption="доля завершённых упражнений" color="#FBBF24" />
        <MetricCard label="Вакансии" value={data.total_vacancies} caption={`${data.total_bookmarks} закладок`} color="#FB7185" />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
        <Ranking title="Популярные навыки" items={data.popular_skills} />
        <Ranking title="Популярные тренажёры" items={data.popular_modules} color="#34D399" />
        <Ranking title="Топ локаций" items={data.top_locations} color="#A78BFA" />
        <Ranking title="Вакансии в закладках" items={data.top_bookmarked_vacancies} color="#FBBF24" />
      </section>
    </div>
  )
}
