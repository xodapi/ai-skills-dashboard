import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

interface SkillEntry {
  skill_id: number
  skill_name: string
  category: string | null
  proficiency_level: number
  created_at: string
}
interface ProgressEntry {
  id: number
  skill: string
  module_index: number
  completed: boolean
  updated_at: string
}
interface BookmarkEntry { skill: string; note: string | null; created_at: string }
interface GamificationSummary {
  total_xp: number
  level: number
  xp_in_current_level: number
  xp_to_next_level: number
  current_streak: number
  longest_streak: number
  badges: Array<{ key: string; title: string; unlocked_at: string }>
}
interface ActivityDay { date: string; completions: number; xp_earned: number }
interface GitHubActivity {
  username: string
  public_repos: number
  repos_analyzed: number
  total_commits: number
  push_events: number
  raw_languages: Record<string, number>
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function levelLabel(level: number) {
  if (level >= 90) return { text: 'Expert', color: '#F59E0B' }
  if (level >= 70) return { text: 'Advanced', color: '#10B981' }
  if (level >= 40) return { text: 'Intermediate', color: '#22D3EE' }
  return { text: 'Beginner', color: '#818CF8' }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d === 0) return 'сегодня'
  if (d === 1) return 'вчера'
  if (d < 7) return `${d} дн. назад`
  if (d < 30) return `${Math.floor(d / 7)} нед. назад`
  return `${Math.floor(d / 30)} мес. назад`
}

export function Profile() {
  const { user, token, isLoading: authLoading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [authLoading, user, navigate])

  const { data: skills } = useQuery<SkillEntry[]>({
    queryKey: ['user-skills', token],
    queryFn: () =>
      fetch(`${API}/users/me/skills`, { headers: authHeaders(token!) }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: progress } = useQuery<ProgressEntry[]>({
    queryKey: ['user-progress', token],
    queryFn: () =>
      fetch(`${API}/users/me/progress`, { headers: authHeaders(token!) }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: bookmarks } = useQuery<BookmarkEntry[]>({
    queryKey: ['user-bookmarks', token],
    queryFn: () =>
      fetch(`${API}/users/me/bookmarks`, { headers: authHeaders(token!) }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: gamification } = useQuery<GamificationSummary>({
    queryKey: ['gamification', token],
    queryFn: () =>
      fetch(`${API}/users/me/gamification`, { headers: authHeaders(token!) }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: activity } = useQuery<ActivityDay[]>({
    queryKey: ['learning-activity', token],
    queryFn: () =>
      fetch(`${API}/users/me/activity?days=91`, { headers: authHeaders(token!) }).then(r => r.json()),
    enabled: !!token,
  })

  const { data: githubActivity, isFetching: isGitHubActivityLoading, isError: isGitHubActivityError } = useQuery<GitHubActivity>({
    queryKey: ['github-activity', user?.login],
    queryFn: async () => {
      const response = await fetch(`${API}/github/skills?username=${encodeURIComponent(user!.login)}`)
      if (!response.ok) throw new Error('Не удалось загрузить GitHub activity')
      return response.json()
    },
    enabled: !!user?.login,
    staleTime: 10 * 60_000,
    retry: false,
  })

  if (authLoading) {
    return (
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Загрузка…</p>
      </div>
    )
  }

  if (!user) return null

  const STAT_ITEMS = [
    { label: 'Уровень', value: gamification?.level ?? 1, icon: '⚡' },
    { label: 'Всего XP', value: gamification?.total_xp ?? 0, icon: '✨' },
    { label: 'Дней подряд', value: gamification?.current_streak ?? 0, icon: '🔥' },
    { label: 'Достижений', value: gamification?.badges.length ?? 0, icon: '🏆' },
  ]
  const activityByDate = new Map((activity ?? []).map(day => [day.date, day]))
  const heatmapDays = Array.from({ length: 91 }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (90 - index))
    const dateKey = day.toISOString().slice(0, 10)
    return { dateKey, day: activityByDate.get(dateKey) }
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Hero */}
      <div className="glass" style={{ padding: '32px 36px', display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.login}
              style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--accent)', display: 'block' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-dim)', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: 'var(--accent)' }}>
              {user.login[0].toUpperCase()}
            </div>
          )}
          <span style={{
            position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%',
            background: '#10B981', border: '3px solid var(--surface-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
          }}>✓</span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.03em' }}>
              {user.name ?? user.login}
            </h1>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: 'rgba(16,185,129,.1)', color: '#10B981', border: '1px solid rgba(16,185,129,.25)', fontWeight: 700 }}>
              {user.role}
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 10 }}>@{user.login}</p>
          {user.bio && <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8, maxWidth: 500, lineHeight: 1.6 }}>{user.bio}</p>}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {user.location && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {user.location}</span>}
            {user.company  && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>🏢 {user.company}</span>}
            {user.email    && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>✉️ {user.email}</span>}
            <a href={`https://github.com/${user.login}`} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              ⬡ github.com/{user.login}
            </a>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout}
          style={{ padding: '8px 18px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0 }}>
          Выйти
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 12 }}>
        {STAT_ITEMS.map(s => (
          <div key={s.label} className="glass" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* GitHub activity */}
      <div className="glass" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              GitHub activity
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Публичные события GitHub, обновляются при открытии профиля
            </p>
          </div>
          <Link to="/github-import" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Анализ репозиториев →
          </Link>
        </div>
        {isGitHubActivityLoading ? (
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Загружаю публичную активность GitHub…</p>
        ) : isGitHubActivityError ? (
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            GitHub временно не отдал activity. Откройте «Анализ репозиториев» и повторите попытку.
          </p>
        ) : githubActivity ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: 10 }}>
              {[
                ['Репозитории', githubActivity.public_repos, 'var(--accent)'],
                ['Проанализировано', githubActivity.repos_analyzed, '#A78BFA'],
                ...(githubActivity.total_commits > 0 ? [['Коммиты', githubActivity.total_commits, '#FBBF24']] : []),
                ['Push events', githubActivity.push_events, '#34D399'],
              ].map(([label, value, color]) => (
                <div key={label as string} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface-4)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: color as string }}>{value}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{label}</p>
                </div>
              ))}
            </div>
            {Object.keys(githubActivity.raw_languages).length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                {Object.entries(githubActivity.raw_languages).slice(0, 6).map(([language, share]) => (
                  <span key={language} style={{ padding: '4px 9px', borderRadius: 999, background: 'var(--accent-dim)', color: 'var(--text-2)', fontSize: 11 }}>
                    {language} <strong style={{ color: 'var(--accent)' }}>{share}%</strong>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* XP, badges and activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
        <div className="glass" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Прогресс уровня
            </p>
            <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 800 }}>
              Уровень {gamification?.level ?? 1}
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-4)' }}>
            <div style={{
              height: '100%',
              width: `${gamification?.xp_in_current_level ?? 0}%`,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #22D3EE, #818CF8)',
              transition: 'width .4s ease',
            }} />
          </div>
          <p style={{ marginTop: 9, color: 'var(--text-3)', fontSize: 12 }}>
            {gamification?.xp_in_current_level ?? 0} XP в текущем уровне · ещё {gamification?.xp_to_next_level ?? 100} XP до следующего
          </p>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 18, paddingTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Достижения
            </p>
            {(gamification?.badges.length ?? 0) === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Завершите первое упражнение, чтобы получить достижение и XP.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {gamification?.badges.map(badge => (
                  <span key={badge.key} title={`Получено ${timeAgo(badge.unlocked_at)}`} style={{
                    padding: '7px 10px', borderRadius: 999, background: 'rgba(245,158,11,.1)',
                    border: '1px solid rgba(245,158,11,.25)', color: '#FBBF24', fontSize: 12, fontWeight: 700,
                  }}>
                    🏆 {badge.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Активность · 13 недель
            </p>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>меньше ← → больше</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 5 }}>
            {heatmapDays.map(({ dateKey, day }) => {
              const intensity = day ? Math.min(day.completions, 4) : 0
              const color = ['var(--surface-4)', 'rgba(34,211,238,.26)', 'rgba(34,211,238,.48)', 'rgba(16,185,129,.68)', '#10B981'][intensity]
              return (
                <span key={dateKey} title={day ? `${dateKey}: ${day.completions} упражн., +${day.xp_earned} XP` : `${dateKey}: нет активности`} style={{
                  aspectRatio: '1', borderRadius: 4, background: color, minWidth: 0,
                  border: intensity ? '1px solid rgba(34,211,238,.16)' : '1px solid transparent',
                }} />
              )
            })}
          </div>
          <p style={{ marginTop: 12, color: 'var(--text-3)', fontSize: 12, lineHeight: 1.5 }}>
            Лучшая серия: {gamification?.longest_streak ?? 0} дн. Поддерживайте темп, завершая упражнения ежедневно.
          </p>
        </div>
      </div>

      {/* Skills + Progress side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>

        {/* Skills */}
        <div className="glass" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Мои навыки ({skills?.length ?? 0})
            </p>
            <Link to="/skills" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Добавить →</Link>
          </div>

          {!skills?.length && (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>Навыки не добавлены</p>
              <Link to="/gap-analyzer"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
                  padding: '7px 14px', borderRadius: 99, border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                  background: 'var(--accent-dim)' }}>
                Запустить Gap Analyzer
              </Link>
            </div>
          )}

          {skills?.slice(0, 12).map(s => {
            const level = s.proficiency_level * 20
            const lbl = levelLabel(level)
            return (
              <div key={s.skill_id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.skill_name}
                </span>
                <div style={{ width: 80, height: 6, background: 'var(--surface-4)', borderRadius: 99, flexShrink: 0 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${level}%`, background: lbl.color, transition: 'width .4s' }} />
                </div>
                <span style={{ fontSize: 10, color: lbl.color, fontWeight: 700, flexShrink: 0, width: 70, textAlign: 'right' }}>
                  {lbl.text}
                </span>
              </div>
            )
          })}

          {(skills?.length ?? 0) > 12 && (
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
              + ещё {(skills?.length ?? 0) - 12} навыков
            </p>
          )}
        </div>

        {/* Training progress */}
        <div className="glass" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Тренажёры
            </p>
            <Link to="/trainer/Python" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Начать →</Link>
          </div>

          {!progress?.length && (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>Модули ещё не начаты</p>
              <Link to="/roadmap"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
                  padding: '7px 14px', borderRadius: 99, border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                  background: 'var(--accent-dim)' }}>
                Выбрать Roadmap
              </Link>
            </div>
          )}

          {progress?.map(p => {
            const pct = p.completed ? 100 : 0
            return (
              <div key={p.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Link to={`/trainer/${encodeURIComponent(p.skill)}`}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', textDecoration: 'none' }}>
                    {p.skill} · упражнение {p.module_index + 1}
                  </Link>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? '#10B981' : 'var(--accent)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--surface-4)', borderRadius: 99, marginBottom: 3 }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`,
                    background: pct === 100 ? '#10B981' : 'linear-gradient(90deg, var(--accent), #22D3EE)',
                    transition: 'width .4s' }} />
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {p.completed ? 'Завершено' : 'В процессе'} · {timeAgo(p.updated_at)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bookmarks */}
      {(bookmarks?.length ?? 0) > 0 && (
        <div className="glass" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Закладки ({bookmarks!.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {bookmarks!.map(b => (
              <Link key={b.skill} to={`/trainer/${encodeURIComponent(b.skill)}`}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                  background: 'var(--surface-4)', color: 'var(--text-1)', textDecoration: 'none',
                  border: '1px solid var(--border)' }}>
                🔖 {b.skill}
                {b.note && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>{b.note}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/assessment"
          style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}>
          🧠 Пройти Skill IQ тест
        </Link>
        <Link to="/salary-calculator"
          style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
          💰 Рассчитать зарплату
        </Link>
        <Link to="/forecast"
          style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--surface-4)', color: 'var(--text-2)', textDecoration: 'none', border: '1px solid var(--border)' }}>
          📈 Прогноз навыков
        </Link>
        <Link to="/roadmap"
          style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--surface-4)', color: 'var(--text-2)', textDecoration: 'none', border: '1px solid var(--border)' }}>
          🗺️ Role Roadmap
        </Link>
      </div>
    </div>
  )
}
