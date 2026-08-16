import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const API = '/api/v1'

// Project ideas for each skill family
const PROJECT_IDEAS: Record<string, { title: string; desc: string; difficulty: 'easy' | 'medium' | 'hard'; tags: string[] }[]> = {
  'Python': [
    { title: 'CLI инструмент для анализа логов', desc: 'Парсинг и агрегация структурированных логов, вывод статистики в терминале', difficulty: 'easy', tags: ['argparse', 'regex', 'JSON'] },
    { title: 'Telegram-бот с командами', desc: 'Бот, который отвечает на вопросы и управляет списком задач', difficulty: 'easy', tags: ['python-telegram-bot', 'SQLite'] },
    { title: 'Web scraper с очередью', desc: 'Асинхронный сбор данных с нескольких источников, сохранение в БД', difficulty: 'medium', tags: ['aiohttp', 'asyncio', 'PostgreSQL'] },
  ],
  'PyTorch': [
    { title: 'Классификатор изображений с нуля', desc: 'CNN на CIFAR-10 без transfer learning: архитектура, обучение, визуализация метрик', difficulty: 'medium', tags: ['CNN', 'training loop', 'tensorboard'] },
    { title: 'Fine-tune BERT для классификации текста', desc: 'Дообучение предобученной модели на собственном датасете', difficulty: 'hard', tags: ['transformers', 'HuggingFace', 'fine-tuning'] },
    { title: 'GAN для генерации изображений', desc: 'Реализация DCGAN для генерации лиц или MNIST-цифр', difficulty: 'hard', tags: ['GAN', 'discriminator', 'generator'] },
  ],
  'Docker': [
    { title: 'Контейнеризация FastAPI приложения', desc: 'Dockerfile, docker-compose с PostgreSQL и Redis, healthcheck', difficulty: 'easy', tags: ['Dockerfile', 'docker-compose', 'networking'] },
    { title: 'Multi-stage build для ML модели', desc: 'Оптимизация образа: builder stage + slim runtime, размер < 200MB', difficulty: 'medium', tags: ['multi-stage', 'layers', 'optimization'] },
    { title: 'Приватный Docker registry', desc: 'Настройка собственного registry с аутентификацией и сканером уязвимостей', difficulty: 'hard', tags: ['registry', 'TLS', 'trivy'] },
  ],
  'Kubernetes': [
    { title: 'Деплой ML сервиса в K8s', desc: 'Deployment + Service + Ingress для inference API с rolling updates', difficulty: 'medium', tags: ['kubectl', 'manifests', 'rolling update'] },
    { title: 'Горизонтальное масштабирование', desc: 'HPA на основе CPU + кастомных метрик Prometheus, нагрузочное тестирование', difficulty: 'hard', tags: ['HPA', 'Prometheus', 'metrics-server'] },
  ],
  'scikit-learn': [
    { title: 'Pipeline для предсказания оттока', desc: 'Feature engineering, cross-validation, стекинг моделей, отчёт на реальных данных', difficulty: 'medium', tags: ['Pipeline', 'GridSearchCV', 'SHAP'] },
    { title: 'Детектор аномалий', desc: 'Isolation Forest + One-Class SVM, ROC-кривые, порог срабатывания', difficulty: 'medium', tags: ['IsolationForest', 'OneClassSVM', 'ROC'] },
  ],
  'SQL': [
    { title: 'Аналитический дашборд на чистом SQL', desc: 'Window functions, CTEs, retention кривые — без ORM, только PostgreSQL', difficulty: 'medium', tags: ['window functions', 'CTE', 'PostgreSQL'] },
    { title: 'ETL пайплайн', desc: 'Инкрементная загрузка из CSV, трансформация, upsert в target таблицу', difficulty: 'hard', tags: ['ETL', 'upsert', 'transactions'] },
  ],
  'LangChain': [
    { title: 'RAG по своим документам', desc: 'Загрузка PDF → chunking → Chroma/FAISS → вопрос-ответ по контексту', difficulty: 'medium', tags: ['RAG', 'embeddings', 'vector store'] },
    { title: 'Multi-step агент с инструментами', desc: 'Агент с доступом к поиску, калькулятору и файловой системе', difficulty: 'hard', tags: ['agents', 'tools', 'ReAct'] },
  ],
  'MLflow': [
    { title: 'Трекинг экспериментов ML проекта', desc: 'Логирование параметров, метрик, артефактов; сравнение запусков в UI', difficulty: 'easy', tags: ['tracking', 'experiments', 'artifacts'] },
    { title: 'Model registry и деплой', desc: 'Регистрация лучшей модели, staging → production, FastAPI serving', difficulty: 'medium', tags: ['model registry', 'serving', 'FastAPI'] },
  ],
  'OpenCV': [
    { title: 'Детектор объектов в реальном времени', desc: 'Видеопоток с веб-камеры, YOLO inference, рисование bbox и счётчик', difficulty: 'medium', tags: ['video', 'YOLO', 'bbox'] },
    { title: 'Система сравнения лиц', desc: 'Face detection → embedding → косинусное сходство, порог авторизации', difficulty: 'hard', tags: ['face detection', 'embeddings', 'cosine similarity'] },
  ],
  'Pandas': [
    { title: 'EDA инструмент для CSV датасетов', desc: 'Автоматический отчёт: типы, пропуски, distribution, корреляции, аномалии', difficulty: 'easy', tags: ['EDA', 'profiling', 'matplotlib'] },
    { title: 'Обработка временных рядов', desc: 'Парсинг временных меток, ресемплинг, rolling statistics, сезонность', difficulty: 'medium', tags: ['time series', 'resample', 'rolling'] },
  ],
  'FastAPI': [
    { title: 'ML Inference API', desc: 'Загрузка модели при старте, async endpoints, Pydantic validation, /health', difficulty: 'medium', tags: ['async', 'Pydantic', 'lifespan'] },
    { title: 'JWT Auth + rate limiting', desc: 'OAuth2 flow, refresh tokens, Redis rate limiter, middleware logging', difficulty: 'hard', tags: ['JWT', 'OAuth2', 'Redis'] },
  ],
  'default': [
    { title: 'Pet-проект с использованием навыка', desc: 'Создайте небольшой проект, решающий реальную задачу с помощью этого инструмента', difficulty: 'medium', tags: ['практика', 'portfolio'] },
    { title: 'Contribute в open source', desc: 'Найдите issue с пометкой "good first issue" в репозитории связанной библиотеки', difficulty: 'easy', tags: ['github', 'open source', 'community'] },
  ],
}

function getProjects(skill: string) {
  for (const key of Object.keys(PROJECT_IDEAS)) {
    if (skill.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skill.toLowerCase())) {
      return PROJECT_IDEAS[key]
    }
  }
  return PROJECT_IDEAS['default']
}

const DIFFICULTY_COLOR = { easy: '#10B981', medium: '#F59E0B', hard: '#F43F5E' }
const DIFFICULTY_LABEL = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }

interface Skill { skill_name: string; demand: number; tier: string }
interface Archetype {
  archetype_id: string; archetype_label: string; complexity: string;
  math_required: boolean; count: number; top_skills: string[]; avg_salary: number
}

const LS_KEY_SKILLS = 'mySkills'
const LS_KEY_DONE = 'discoveryDone'
const LS_KEY_SAVED = 'discoverySaved'

export function Discovery() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mySkills, setMySkills] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY_SKILLS) ?? '[]') } catch { return [] }
  })
  const [doneSkills, setDoneSkills] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY_DONE) ?? '[]') } catch { return [] }
  })
  const [savedProjects, setSavedProjects] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY_SAVED) ?? '[]') } catch { return [] }
  })
  const [filter, setFilter] = useState<'all' | 'hot' | 'saved' | 'done'>('all')
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [shareMsg, setShareMsg] = useState('')

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

  // All skills missing from mySkills (across all archetypes)
  const missingSkills = useMemo(() => {
    const allNeeded = new Set(archetypes.flatMap(a => a.top_skills))
    const missing = skills.filter(s => allNeeded.has(s.skill_name) && !mySkills.includes(s.skill_name))
    // If user hasn't selected any skills yet, return empty array to show welcome screen
    return mySkills.length === 0 ? [] : missing
  }, [skills, archetypes, mySkills])

  const displaySkills = useMemo(() => {
    if (filter === 'hot') return missingSkills.filter(s => s.tier === 'hot' || s.tier === 'high')
    if (filter === 'saved') return missingSkills.filter(s => savedProjects.includes(s.skill_name))
    if (filter === 'done') return missingSkills.filter(s => doneSkills.includes(s.skill_name))
    return missingSkills
  }, [missingSkills, filter, savedProjects, doneSkills])

  // Save to localStorage
  useEffect(() => { localStorage.setItem(LS_KEY_SKILLS, JSON.stringify(mySkills)) }, [mySkills])
  useEffect(() => { localStorage.setItem(LS_KEY_DONE, JSON.stringify(doneSkills)) }, [doneSkills])
  useEffect(() => { localStorage.setItem(LS_KEY_SAVED, JSON.stringify(savedProjects)) }, [savedProjects])

  const markDone = (skill: string) => {
    setDoneSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }
  const toggleSave = (skill: string) => {
    setSavedProjects(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const shareProgress = () => {
    const url = new URL(window.location.origin + '/discovery')
    url.searchParams.set('skills', mySkills.join(','))
    url.searchParams.set('done', doneSkills.join(','))
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShareMsg('Ссылка скопирована!')
      setTimeout(() => setShareMsg(''), 2500)
    })
  }

  const progressPct = missingSkills.length > 0 ? Math.round((doneSkills.filter(d => missingSkills.some(m => m.skill_name === d)).length / missingSkills.length) * 100) : 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="tag">Discovery</span>
          <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)' }}>
            {missingSkills.length} навыков для изучения
          </span>
          {doneSkills.length > 0 && (
            <span className="tag" style={{ background: 'rgba(16,185,129,.1)', color: 'var(--success)', borderColor: 'rgba(16,185,129,.25)' }}>
              ✓ {doneSkills.length} пройдено
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              marginBottom: 8,
            }}>Навыки для изучения</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 640, lineHeight: 1.7 }}>
              Ниже — навыки которых нет в вашем профиле, но которые требуются на реальных вакансиях.
              Для каждого: готовые проекты, тренажёр и ссылка на учебный трек.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/gap-analyzer" style={{
              padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            }}>
              ⊕ Gap Analyzer
            </Link>
            <button onClick={shareProgress} className="btn-ghost" style={{ fontSize: 13, padding: '8px 18px' }}>
              {shareMsg || '↗ Поделиться'}
            </button>
          </div>
        </div>
      </section>

      {/* Progress bar */}
      {missingSkills.length > 0 && (
        <div className="glass" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Прогресс освоения</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: progressPct >= 80 ? 'var(--success)' : 'var(--accent)' }}>{progressPct}%</p>
          </div>
          <div style={{ height: 8, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: `linear-gradient(90deg, var(--accent), var(--success))`,
              width: `${progressPct}%`,
              transition: 'width .5s ease',
              boxShadow: 'var(--glow-sm)',
            }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            {doneSkills.filter(d => missingSkills.some(m => m.skill_name === d)).length} из {missingSkills.length} навыков освоено
          </p>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([['all', 'Все навыки'], ['hot', '🔥 Горячие'], ['saved', '★ Сохранённые'], ['done', '✓ Пройденные']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
              background: filter === id ? 'var(--accent-dim)' : 'transparent',
              color: filter === id ? 'var(--accent)' : 'var(--text-2)',
              border: filter === id ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--border)',
              cursor: 'pointer', transition: 'all .15s',
            }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)', alignSelf: 'center' }}>
          {displaySkills.length} навыков
        </span>
      </div>

      {/* Skill cards */}
      {missingSkills.length === 0 && mySkills.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>👋</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
            Добро пожаловать в Discovery!
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
            Сначала выберите свои навыки в Gap Analyzer, чтобы увидеть, какие навыки стоит изучить дальше.
          </p>
          <Link to="/gap-analyzer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 600,
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
            border: '1px solid var(--accent)',
          }}>
            ⊕ Открыть Gap Analyzer
          </Link>
        </div>
      ) : displaySkills.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            {filter === 'done' ? 'Нет пройденных навыков' : filter === 'saved' ? 'Нет сохранённых' : 'Отлично! Все навыки пройдены'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {filter !== 'all' ? 'Попробуйте другой фильтр' : 'Вы освоили все востребованные навыки'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displaySkills.map(skill => {
            const isExpanded = expandedSkill === skill.skill_name
            const isDone = doneSkills.includes(skill.skill_name)
            const isSaved = savedProjects.includes(skill.skill_name)
            const projects = getProjects(skill.skill_name)
            const tierColor = skill.tier === 'hot' ? 'var(--danger)' : skill.tier === 'high' ? 'var(--warning)' : skill.tier === 'medium' ? 'var(--accent)' : 'var(--text-3)'

            // Which archetypes need this skill
            const needingRoles = archetypes.filter(a => a.top_skills.includes(skill.skill_name))

            return (
              <div key={skill.skill_name} className="glass" style={{
                overflow: 'hidden',
                border: isDone ? '1px solid rgba(16,185,129,.25)' : '1px solid var(--border)',
                transition: 'all .25s',
                opacity: isDone ? .75 : 1,
              }}>
                {/* Card header */}
                <div style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }} onClick={() => setExpandedSkill(isExpanded ? null : skill.skill_name)}>

                  {/* Done toggle */}
                  <button onClick={e => { e.stopPropagation(); markDone(skill.skill_name) }} style={{
                    width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                    background: isDone ? 'rgba(16,185,129,.2)' : 'var(--surface-4)',
                    border: isDone ? '1px solid rgba(16,185,129,.4)' : '1px solid var(--border)',
                    color: isDone ? 'var(--success)' : 'var(--text-3)',
                    fontSize: 14, cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone ? '✓' : '○'}
                  </button>

                  {/* Skill name + demand */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: isDone ? 'var(--text-3)' : 'var(--text-1)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {skill.skill_name}
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 600, color: tierColor, padding: '2px 8px', borderRadius: 99, background: `color-mix(in srgb, ${tierColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${tierColor} 25%, transparent)` }}>
                        {skill.demand}% вакансий
                      </span>
                      {skill.tier === 'hot' && <span style={{ fontSize: 11 }}>🔥</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                      {needingRoles.slice(0, 3).map(r => (
                        <span key={r.archetype_id} style={{ fontSize: 10, color: 'var(--text-3)', padding: '1px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
                          {r.archetype_label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); toggleSave(skill.skill_name) }} style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: isSaved ? 'rgba(245,158,11,.1)' : 'transparent',
                      border: isSaved ? '1px solid rgba(245,158,11,.3)' : '1px solid var(--border)',
                      color: isSaved ? 'var(--warning)' : 'var(--text-3)',
                      fontSize: 14, cursor: 'pointer', transition: 'all .15s',
                    }}>★</button>
                    <Link to={`/trainer/${encodeURIComponent(skill.skill_name)}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none',
                        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                        flexShrink: 0,
                      }}>
                      🎯 Тренажёр
                    </Link>
                    <span style={{ color: 'var(--text-3)', fontSize: 14, transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>
                </div>

                {/* Expanded: projects */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '20px', background: 'color-mix(in srgb, var(--surface-2) 50%, transparent)' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Проекты для портфолио
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                      {projects.map((proj, i) => {
                        const projKey = `${skill.skill_name}::${i}`
                        const projDone = savedProjects.includes(projKey)
                        const dc = DIFFICULTY_COLOR[proj.difficulty]

                        return (
                          <div key={i} style={{
                            padding: '16px', borderRadius: 12,
                            background: 'var(--surface-3)',
                            border: projDone ? `1px solid color-mix(in srgb, ${dc} 35%, transparent)` : '1px solid var(--border)',
                            transition: 'all .2s',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{proj.title}</p>
                              <span style={{ fontSize: 10, fontWeight: 600, color: dc, padding: '2px 8px', borderRadius: 99, background: `color-mix(in srgb, ${dc} 12%, transparent)`, flexShrink: 0 }}>
                                {DIFFICULTY_LABEL[proj.difficulty]}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 12 }}>{proj.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {proj.tags.map(tag => (
                                  <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--surface-4)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <button onClick={() => setSavedProjects(prev => prev.includes(projKey) ? prev.filter(p => p !== projKey) : [...prev, projKey])}
                                style={{
                                  fontSize: 11, padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                                  background: projDone ? `color-mix(in srgb, ${dc} 15%, transparent)` : 'transparent',
                                  color: projDone ? dc : 'var(--text-3)',
                                  border: projDone ? `1px solid color-mix(in srgb, ${dc} 30%, transparent)` : '1px solid var(--border)',
                                  transition: 'all .15s', fontWeight: 600,
                                }}>
                                {projDone ? '✓ Взял в работу' : '+ В план'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
