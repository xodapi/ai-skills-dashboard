import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const API = '/api/v1'

interface GitHubSkillResult {
  username: string
  avatar_url: string | null
  name: string | null
  bio: string | null
  public_repos: number
  skills: Array<{ skill: string; source: string; evidence: string; confidence: number }>
  raw_languages: Record<string, number>
  raw_topics: string[]
}

interface SaveResult { saved: number; skills: string[] }

export function GitHubImport() {
  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const qc = useQueryClient()

  const { data, isFetching, isError } = useQuery<GitHubSkillResult>({
    queryKey: ['github-skills', submitted],
    queryFn: () =>
      fetch(`${API}/github/skills?username=${encodeURIComponent(submitted)}`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!submitted,
    retry: false,
  })

  const saveMutation = useMutation<SaveResult, Error, string[]>({
    mutationFn: (skills) =>
      fetch(`${API}/users/me/skills/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
        },
        body: JSON.stringify({ skills: skills.map(s => ({ skill: s, source: 'github', level: 50 })) }),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-skills'] })
    },
  })

  const toggleAll = () => {
    if (!data) return
    const all = new Set(data.skills.map(s => s.skill))
    setSelected(prev => prev.size === all.size ? new Set() : all)
  }

  const toggle = (skill: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(skill) ? s.delete(skill) : s.add(skill); return s })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = username.trim().replace(/^@/, '')
    if (v) { setSubmitted(v); setSelected(new Set()); }
  }

  const CONF_COLOR = (c: number) =>
    c >= 0.8 ? '#10B981' : c >= 0.5 ? '#22D3EE' : '#94A3B8'

  const SOURCE_ICON: Record<string, string> = {
    language: '💻', topic: '🏷️', framework: '⚙️', inferred: '🔍',
  }

  const saved = saveMutation.isSuccess

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">GitHub Import</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.1)', color: '#818CF8', borderColor: 'rgba(129,140,248,.25)' }}>
            Публичное API · без OAuth
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Импорт навыков с GitHub
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 560, lineHeight: 1.7 }}>
          Введите GitHub username — анализируем языки и топики публичных репозиториев и определяем ваши навыки.
        </p>
      </section>

      {/* Search form */}
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: .5 }}>⬡</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="GitHub username (напр. torvalds)"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px',
                background: 'var(--surface-4)', border: '1px solid var(--border)',
                borderRadius: 12, fontSize: 15, color: 'var(--text-1)',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <button type="submit" disabled={!username.trim() || isFetching}
            style={{
              padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: username.trim() ? 'var(--accent)' : 'var(--surface-4)',
              color: username.trim() ? '#fff' : 'var(--text-3)',
              border: 'none', cursor: username.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
            }}>
            {isFetching ? '⏳ Анализирую…' : '🔍 Анализировать'}
          </button>
        </div>
      </form>

      {/* Loading */}
      {isFetching && (
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Загружаю репозитории {submitted}…</p>
        </div>
      )}

      {/* Error */}
      {isError && !isFetching && (
        <div className="glass" style={{ padding: 24, border: '1px solid rgba(244,63,94,.25)', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#F43F5E', fontWeight: 600 }}>Пользователь не найден или API недоступен</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Проверьте username и попробуйте снова</p>
        </div>
      )}

      {/* Results */}
      {data && !isFetching && (
        <>
          {/* Profile card */}
          <div className="glass" style={{ padding: '20px 24px', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            {data.avatar_url && (
              <img src={data.avatar_url} alt={data.username}
                style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--accent)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>
                {data.name ?? data.username}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>@{data.username}</p>
              {data.bio && <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 400 }}>{data.bio}</p>}
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>{data.public_repos}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>репозиториев</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 900, color: '#10B981' }}>{data.skills.length}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>навыков</p>
              </div>
            </div>
          </div>

          {/* Raw languages mini-bar */}
          {Object.keys(data.raw_languages).length > 0 && (
            <div className="glass" style={{ padding: '16px 22px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Языки в репозиториях
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(data.raw_languages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 12)
                  .map(([lang, pct]) => (
                    <span key={lang} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                      {lang} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Skills selection */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Найденные навыки ({data.skills.length})
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={toggleAll}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  {selected.size === data.skills.length ? 'Снять все' : 'Выбрать все'}
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 10px' }}>
                  Выбрано: {selected.size}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.skills.map(s => {
                const checked = selected.has(s.skill)
                return (
                  <label key={s.skill}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                      borderRadius: 10, cursor: 'pointer', transition: 'background .1s',
                      background: checked ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surface-4)',
                      border: checked ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' : '1px solid transparent',
                    }}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(s.skill)}
                      style={{ accentColor: 'var(--accent)', width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ fontSize: 11 }}>{SOURCE_ICON[s.source] ?? '📦'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>{s.skill}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.evidence}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <div style={{ width: 28, height: 4, background: 'var(--surface-3)', borderRadius: 99 }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${s.confidence * 100}%`, background: CONF_COLOR(s.confidence) }} />
                      </div>
                      <span style={{ fontSize: 10, color: CONF_COLOR(s.confidence), fontWeight: 700 }}>
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Save / success */}
          {saved ? (
            <div className="glass" style={{ padding: '20px 24px', border: '1px solid rgba(16,185,129,.3)', textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginBottom: 8 }}>✓ Навыки сохранены!</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                {saveMutation.data?.saved} навыков добавлено в ваш профиль.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link to="/profile" style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: '#10B981', color: '#fff', textDecoration: 'none' }}>
                  Посмотреть профиль
                </Link>
                <Link to="/salary-calculator" style={{ padding: '10px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                  💰 Рассчитать зарплату
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => saveMutation.mutate([...selected])}
                disabled={selected.size === 0 || saveMutation.isPending}
                style={{
                  padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700,
                  background: selected.size > 0 ? 'var(--accent)' : 'var(--surface-4)',
                  color: selected.size > 0 ? '#fff' : 'var(--text-3)',
                  border: 'none', cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                }}>
                {saveMutation.isPending ? '⏳ Сохраняю…' : `💾 Сохранить ${selected.size > 0 ? `(${selected.size})` : ''}`}
              </button>
              <Link to="/salary-calculator" style={{
                padding: '12px 20px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                background: 'var(--surface-4)', color: 'var(--text-2)', textDecoration: 'none',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
              }}>
                💰 Сразу в калькулятор зарплаты
              </Link>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!data && !isFetching && !isError && (
        <div className="glass" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>⬡</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
            Введите GitHub username выше
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
            Анализ работает через публичный API — логин не нужен
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['torvalds', 'gvanrossum', 'karpathy', 'tiangolo'].map(u => (
              <button key={u} onClick={() => { setUsername(u); setSubmitted(u) }}
                style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, background: 'var(--surface-4)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                @{u}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
