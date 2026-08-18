import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

// ── Trainer catalog ────────────────────────────────────────────────────────────
interface TrainerMeta {
  moduleId: string
  title: string
  icon: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedMinutes: number
  totalExercises: number
  description: string
  category: 'classic' | 'ai-native'
  comingSoon?: boolean
}

interface ProgressEntry {
  skill: string
  completed: boolean
}

const TRAINERS: TrainerMeta[] = [
  { moduleId: 'Python', title: 'Python', icon: '🐍', difficulty: 'Beginner', estimatedMinutes: 30, totalExercises: 3, description: 'Основы синтаксиса, типы данных, list comprehensions', category: 'classic' },
  { moduleId: 'PyTorch', title: 'PyTorch', icon: '🔥', difficulty: 'Intermediate', estimatedMinutes: 45, totalExercises: 3, description: 'Тензоры, autograd, построение нейросетей', category: 'classic' },
  { moduleId: 'Docker', title: 'Docker', icon: '🐳', difficulty: 'Beginner', estimatedMinutes: 35, totalExercises: 3, description: 'Контейнеризация, Dockerfile, docker-compose', category: 'classic' },
  { moduleId: 'Kubernetes', title: 'Kubernetes', icon: '☸️', difficulty: 'Advanced', estimatedMinutes: 50, totalExercises: 3, description: 'Pods, Deployments, Services, масштабирование', category: 'classic' },
  { moduleId: 'LangChain', title: 'LangChain', icon: '🦜', difficulty: 'Intermediate', estimatedMinutes: 40, totalExercises: 3, description: 'Цепочки промптов, агенты, RAG-системы', category: 'classic' },
  { moduleId: 'SQL', title: 'SQL', icon: '🗄️', difficulty: 'Beginner', estimatedMinutes: 30, totalExercises: 3, description: 'SELECT, JOIN, GROUP BY, подзапросы', category: 'classic' },
  { moduleId: 'MLflow', title: 'MLflow', icon: '📊', difficulty: 'Intermediate', estimatedMinutes: 35, totalExercises: 3, description: 'Tracking экспериментов, модели, registry', category: 'classic' },
  { moduleId: 'scikit-learn', title: 'scikit-learn', icon: '🤖', difficulty: 'Intermediate', estimatedMinutes: 40, totalExercises: 3, description: 'Классификация, регрессия, пайплайны', category: 'classic' },
  { moduleId: 'Computer Vision', title: 'Computer Vision', icon: '👁️', difficulty: 'Advanced', estimatedMinutes: 45, totalExercises: 3, description: 'CNN, детекция объектов, сегментация', category: 'classic' },
  { moduleId: 'Transformers', title: 'Transformers', icon: '🤗', difficulty: 'Advanced', estimatedMinutes: 50, totalExercises: 3, description: 'BERT, GPT, fine-tuning, токенизация', category: 'classic' },
  { moduleId: 'Pandas', title: 'Pandas', icon: '🐼', difficulty: 'Beginner', estimatedMinutes: 30, totalExercises: 3, description: 'DataFrame, фильтрация, группировки, join', category: 'classic' },
  { moduleId: 'FastAPI', title: 'FastAPI', icon: '⚡', difficulty: 'Intermediate', estimatedMinutes: 35, totalExercises: 3, description: 'REST API, валидация, async endpoints', category: 'classic' },
  { moduleId: 'OpenCV', title: 'OpenCV', icon: '📷', difficulty: 'Intermediate', estimatedMinutes: 40, totalExercises: 3, description: 'Обработка изображений, фильтры, детекция', category: 'classic' },
  { moduleId: 'Airflow', title: 'Airflow', icon: '🌀', difficulty: 'Advanced', estimatedMinutes: 45, totalExercises: 3, description: 'DAG, операторы, расписания, мониторинг', category: 'classic' },
  { moduleId: 'Terraform', title: 'Terraform', icon: '🏗️', difficulty: 'Advanced', estimatedMinutes: 40, totalExercises: 3, description: 'IaC, провайдеры, модули, state', category: 'classic' },
  { moduleId: 'AI Native', title: 'AI-Native Engineering', icon: '🤖', difficulty: 'Advanced', estimatedMinutes: 75, totalExercises: 5, description: 'Ревью AI-кода, orchestration, incident response, архитектура и MVP scope', category: 'ai-native' },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: '#10B981',
  Intermediate: '#F59E0B',
  Advanced: '#F43F5E',
}

export function Trainers() {
  const { token } = useAuth()
  const [catalogMode, setCatalogMode] = useState<'classic' | 'ai-native'>('classic')

  const { data: progressData } = useQuery<ProgressEntry[]>({
    queryKey: ['user-progress', token],
    queryFn: () =>
      fetch(`${API}/users/me/progress`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    enabled: !!token,
    staleTime: 60_000,
  })

  const progressMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of progressData ?? []) {
      if (p.completed) {
        map.set(p.skill, (map.get(p.skill) ?? 0) + 1)
      }
    }
    return map
  }, [progressData])

  const visibleTrainers = TRAINERS.filter(trainer => trainer.category === catalogMode)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Тренажёры</span>
          <span className="tag" style={{ background: 'rgba(34,211,238,.1)', color: 'var(--cyan)', borderColor: 'rgba(34,211,238,.25)' }}>
            {visibleTrainers.length} модулей
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--cyan))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Каталог тренажёров
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>
          Выберите классический трек или AI-native практику: оценку, проверку и управление работой AI-агентов.
        </p>
      </section>

      <section aria-label="Режим каталога" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { value: 'classic' as const, label: '📚 Classic Mode' },
          { value: 'ai-native' as const, label: '🤖 AI Mode' },
        ].map(mode => {
          const active = catalogMode === mode.value
          return (
            <button
              key={mode.value}
              onClick={() => setCatalogMode(mode.value)}
              aria-pressed={active}
              style={{
                minHeight: 44, padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: active ? 'var(--accent-dim)' : 'var(--surface-3)',
                color: active ? 'var(--accent)' : 'var(--text-2)', fontSize: 13, fontWeight: 800,
              }}
            >
              {mode.label}
            </button>
          )
        })}
      </section>

      {/* Trainer grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {visibleTrainers.map(trainer => {
          const completed = progressMap.get(trainer.moduleId) ?? 0
          const progressPct = trainer.totalExercises > 0 ? Math.round((completed / trainer.totalExercises) * 100) : 0
          const diffColor = DIFFICULTY_COLOR[trainer.difficulty]

          return (
            <Link
              key={trainer.moduleId}
              to={trainer.comingSoon ? '#' : `/trainer/${encodeURIComponent(trainer.moduleId)}`}
              style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                padding: '20px 22px', borderRadius: 12,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                textDecoration: 'none', transition: 'all .2s',
                cursor: trainer.comingSoon ? 'default' : 'pointer',
                opacity: trainer.comingSoon ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!trainer.comingSoon) {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.borderColor = 'color-mix(in srgb, var(--accent) 40%, transparent)'
                  el.style.boxShadow = '0 4px 24px rgba(0,0,0,.3)'
                }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'var(--border)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32 }}>{trainer.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', marginBottom: 2 }}>
                    {trainer.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700,
                      background: `color-mix(in srgb, ${diffColor} 12%, transparent)`,
                      color: diffColor, border: `1px solid color-mix(in srgb, ${diffColor} 25%, transparent)`,
                    }}>
                      {trainer.difficulty}
                    </span>
                    {trainer.category === 'ai-native' && (
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 700,
                        color: '#A78BFA', background: 'rgba(167,139,250,.12)', border: '1px solid rgba(167,139,250,.25)',
                      }}>
                        AI Era
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {trainer.estimatedMinutes} мин
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                {trainer.description}
              </p>

              {/* Progress bar */}
              {!trainer.comingSoon && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {completed} / {trainer.totalExercises} упражнений
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: progressPct === 100 ? '#10B981' : 'var(--accent)' }}>
                      {progressPct}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99, width: `${progressPct}%`,
                      background: progressPct === 100 ? '#10B981' : 'var(--accent)',
                      transition: 'width .5s ease',
                    }} />
                  </div>
                  {progressPct === 100 && (
                    <p style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 6 }}>
                      ✓ Завершено
                    </p>
                  )}
                </div>
              )}

              {trainer.comingSoon && (
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(148,163,184,.1)', border: '1px solid rgba(148,163,184,.2)', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Coming Soon</p>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* CTA */}
      <div className="glass" style={{ padding: '24px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
          Не видишь нужный тренажёр? Добавим по запросу.
        </p>
        <Link to="/gap-analyzer" style={{
          padding: '10px 22px', borderRadius: 99, fontSize: 13, fontWeight: 700,
          background: 'var(--accent)', color: '#fff', textDecoration: 'none',
        }}>
          Анализ пробелов →
        </Link>
      </div>
    </div>
  )
}
