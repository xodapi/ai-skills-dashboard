import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

interface AdminUser {
  id: number
  username: string
  display_name: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login: string | null
  skills_count: number
  completed_exercises: number
  total_xp: number
}

interface AdminUserDetail extends AdminUser {
  email: string | null
  location: string | null
  website: string | null
  current_streak: number
  longest_streak: number
  badges_count: number
}

interface UsersPage {
  total: number
  page: number
  page_size: number
  users: AdminUser[]
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' })
const headers = (token: string) => ({ Authorization: `Bearer ${token}` })

export function AdminUsers() {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const pageSize = 20
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (search.trim()) query.set('search', search.trim())

  const { data, isLoading, isError } = useQuery<UsersPage>({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const response = await fetch(`${API}/admin/users?${query}`, { headers: headers(token!) })
      if (!response.ok) throw new Error('Не удалось загрузить пользователей')
      return response.json()
    },
    enabled: !!token,
  })

  const { data: detail } = useQuery<AdminUserDetail>({
    queryKey: ['admin-user', selectedId],
    queryFn: async () => {
      const response = await fetch(`${API}/admin/users/${selectedId}`, { headers: headers(token!) })
      if (!response.ok) throw new Error('Не удалось загрузить пользователя')
      return response.json()
    },
    enabled: !!token && selectedId !== null,
  })

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <Link to="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>← Обзор</Link>
          <h1 style={{ color: 'var(--text-1)', fontSize: 'clamp(1.8rem,4vw,2.7rem)', fontWeight: 900, letterSpacing: '-.04em', marginTop: 10 }}>Пользователи</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 8 }}>Только просмотр. Изменение ролей и блокировки не входят в Phase 1.</p>
        </div>
        <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Поиск по имени"
          style={{ minHeight: 40, width: 230, padding: '0 14px', color: 'var(--text-1)', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 999, outline: 'none' }} />
      </section>

      <div className="glass" style={{ overflowX: 'auto' }}>
        {isLoading ? <p style={{ padding: 24, color: 'var(--text-3)' }}>Загрузка…</p>
          : isError ? <p style={{ padding: 24, color: '#FB7185' }}>Не удалось загрузить пользователей.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 790 }}>
                <thead><tr>{['Пользователь', 'Роль', 'Статус', 'Навыки', 'Практика', 'XP', 'Вход'].map(label => (
                  <th key={label} style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-3)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{label}</th>
                ))}</tr></thead>
                <tbody>{data?.users.map(user => (
                  <tr key={user.id} onClick={() => setSelectedId(user.id)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 16px' }}><strong style={{ color: 'var(--text-1)', fontSize: 13 }}>{user.display_name ?? user.username}</strong><span style={{ display: 'block', color: 'var(--text-3)', fontSize: 11 }}>@{user.username}</span></td>
                    <td style={{ padding: '13px 16px' }}><span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800, color: user.role === 'admin' ? '#FBBF24' : 'var(--text-2)', background: user.role === 'admin' ? 'rgba(245,158,11,.12)' : 'var(--surface-4)' }}>{user.role}</span></td>
                    <td style={{ padding: '13px 16px', color: user.is_active ? '#34D399' : '#FB7185', fontSize: 12 }}>{user.is_active ? 'Активен' : 'Отключён'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontSize: 13 }}>{user.skills_count}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontSize: 13 }}>{user.completed_exercises}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--accent)', fontSize: 13, fontWeight: 800 }}>{user.total_xp}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-3)', fontSize: 12 }}>{user.last_login ? dateFormat.format(new Date(user.last_login)) : '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-3)', fontSize: 12 }}>
        <span>{data?.total ?? 0} пользователей · страница {page} из {totalPages}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage(current => current - 1)} style={{ padding: '7px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface-3)', color: 'var(--text-2)', cursor: 'pointer' }}>←</button>
          <button disabled={page >= totalPages} onClick={() => setPage(current => current + 1)} style={{ padding: '7px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--surface-3)', color: 'var(--text-2)', cursor: 'pointer' }}>→</button>
        </div>
      </div>

      {selectedId !== null && (
        <div role="dialog" aria-modal="true" className="glass" style={{ padding: 22, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase', fontWeight: 800 }}>Детали пользователя</p>
              <h2 style={{ color: 'var(--text-1)', fontSize: 20, fontWeight: 900, marginTop: 5 }}>{detail?.display_name ?? detail?.username ?? 'Загрузка…'}</h2>
            </div>
            <button onClick={() => setSelectedId(null)} style={{ color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
          {detail && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 18 }}>
            {[
              ['Email', detail.email ?? '—'], ['Локация', detail.location ?? '—'], ['XP', detail.total_xp], ['Streak', `${detail.current_streak} / ${detail.longest_streak}`], ['Достижения', detail.badges_count], ['Создан', dateFormat.format(new Date(detail.created_at))],
            ].map(([label, value]) => <div key={label} style={{ padding: 12, background: 'var(--surface-4)', borderRadius: 10 }}><p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</p><p style={{ color: 'var(--text-1)', fontSize: 13, marginTop: 4, overflowWrap: 'anywhere' }}>{value}</p></div>)}
          </div>}
        </div>
      )}
    </div>
  )
}
