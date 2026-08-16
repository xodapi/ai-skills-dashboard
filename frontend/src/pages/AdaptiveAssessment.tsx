import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

// ── Question bank ──────────────────────────────────────────────────────────────
type Difficulty = 'easy' | 'medium' | 'hard'
interface Question {
  id: string
  domain: string
  difficulty: Difficulty
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

const QUESTIONS: Question[] = [
  // ── Python ──────────────────────────────────────────────────────────────────
  { id: 'py_e1', domain: 'Python', difficulty: 'easy',
    text: 'Что выведет: `print(type([]))`?',
    options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "list"],
    correctIndex: 0, explanation: 'Тип пустого литерала [] — встроенный class list.' },
  { id: 'py_e2', domain: 'Python', difficulty: 'easy',
    text: 'Какой оператор используется для целочисленного деления в Python 3?',
    options: ['/', '//', '%', '**'],
    correctIndex: 1, explanation: '// выполняет floor division и возвращает int при целых операндах.' },
  { id: 'py_m1', domain: 'Python', difficulty: 'medium',
    text: 'Что вернёт `[x**2 for x in range(4) if x % 2 == 0]`?',
    options: ['[0, 4]', '[0, 1, 4, 9]', '[4, 16]', '[0, 4, 16]'],
    correctIndex: 0, explanation: 'range(4) = 0,1,2,3; чётные: 0,2; квадраты: 0,4.' },
  { id: 'py_m2', domain: 'Python', difficulty: 'medium',
    text: 'Какой декоратор превращает генераторную функцию в async-генератор в asyncio?',
    options: ['@asyncio.coroutine', '@async_generator', 'Достаточно async def + yield', '@types.coroutine'],
    correctIndex: 2, explanation: 'async def + yield внутри тела создаёт async generator без доп. декораторов.' },
  { id: 'py_h1', domain: 'Python', difficulty: 'hard',
    text: 'В чём разница между `__slots__` и обычным `__dict__` у экземпляра класса?',
    options: [
      '__slots__ хранит атрибуты в массиве, экономя ~40–60 байт на экземпляр',
      '__slots__ запрещает добавление любых атрибутов вообще',
      '__slots__ ускоряет вызовы методов в 10×',
      '__slots__ только для классов-данных (dataclass)',
    ],
    correctIndex: 0, explanation: '__slots__ заменяет __dict__ на компактный массив C-уровня, снижая накладные расходы памяти.' },

  // ── Machine Learning ─────────────────────────────────────────────────────────
  { id: 'ml_e1', domain: 'ML Engineering', difficulty: 'easy',
    text: 'Как называется метрика для задачи бинарной классификации при дисбалансе классов?',
    options: ['Accuracy', 'F1-score', 'MAE', 'R²'],
    correctIndex: 1, explanation: 'F1 = 2·(P·R)/(P+R) — гармоническое среднее precision и recall, устойчивое к дисбалансу.' },
  { id: 'ml_e2', domain: 'ML Engineering', difficulty: 'easy',
    text: 'Что такое переобучение (overfitting)?',
    options: [
      'Модель хорошо работает на train, но плохо на test',
      'Модель плохо работает на обоих наборах',
      'Модель сходится слишком медленно',
      'Модель имеет слишком мало параметров',
    ],
    correctIndex: 0, explanation: 'Overfitting: модель «заучила» обучающий набор и не обобщается на новые данные.' },
  { id: 'ml_m1', domain: 'ML Engineering', difficulty: 'medium',
    text: 'Какой метод GridSearchCV использует для оценки качества на каждом наборе гиперпараметров?',
    options: ['Hold-out', 'K-fold cross-validation', 'Bootstrap', 'Leave-one-out'],
    correctIndex: 1, explanation: 'GridSearchCV по умолчанию использует стратифицированный k-fold (k=5).' },
  { id: 'ml_m2', domain: 'ML Engineering', difficulty: 'medium',
    text: 'Что делает `StandardScaler` перед обучением?',
    options: [
      'Нормализует в [0, 1]',
      'Удаляет выбросы',
      'Центрирует по μ=0, σ=1',
      'Логарифмирует числовые признаки',
    ],
    correctIndex: 2, explanation: 'StandardScaler: x ← (x − μ) / σ, приводя к нулевому среднему и единичному СО.' },
  { id: 'ml_h1', domain: 'ML Engineering', difficulty: 'hard',
    text: 'Почему Random Forest в среднем не страдает от переобучения при росте числа деревьев?',
    options: [
      'Деревья усредняют ошибки; дисперсия падает, смещение остаётся',
      'Каждое дерево использует меньше данных',
      'Бустинговый компонент штрафует сложные деревья',
      'Применяется dropout на каждом сплите',
    ],
    correctIndex: 0, explanation: 'Bagging снижает variance за счёт усреднения независимых деревьев; смещение существенно не растёт.' },

  // ── LLM / NLP ────────────────────────────────────────────────────────────────
  { id: 'nlp_e1', domain: 'NLP / LLM', difficulty: 'easy',
    text: 'Что такое токен в контексте LLM?',
    options: [
      'Символ Unicode',
      'Слово или часть слова, единица входного текста',
      'Слой трансформера',
      'Вектор embedding размерностью 768',
    ],
    correctIndex: 1, explanation: 'Токен — минимальная единица текста для LLM; BPE/WordPiece режут слова на части.' },
  { id: 'nlp_m1', domain: 'NLP / LLM', difficulty: 'medium',
    text: 'Что такое RAG (Retrieval-Augmented Generation)?',
    options: [
      'Fine-tuning модели на доменных данных',
      'Поиск релевантных фрагментов + генерация с контекстом',
      'Квантизация модели до INT4',
      'Техника дистилляции знаний',
    ],
    correctIndex: 1, explanation: 'RAG: retrieve → augment prompt → generate. Не изменяет веса модели.' },
  { id: 'nlp_h1', domain: 'NLP / LLM', difficulty: 'hard',
    text: 'В чём ключевое отличие LoRA от полного fine-tuning?',
    options: [
      'LoRA обучает только нормы слоёв',
      'LoRA добавляет низкоранговые матрицы ΔW = BA вместо изменения W',
      'LoRA применяется только к эмбеддинговому слою',
      'LoRA использует gradient checkpointing по умолчанию',
    ],
    correctIndex: 1, explanation: 'LoRA: W → W + BA, rank r ≪ d. Обучается только B и A (< 1% параметров).' },

  // ── MLOps ────────────────────────────────────────────────────────────────────
  { id: 'mlops_e1', domain: 'MLOps', difficulty: 'easy',
    text: 'Для чего нужен MLflow?',
    options: [
      'Запуск ML моделей в продакшн',
      'Отслеживание экспериментов, метрик и артефактов',
      'Построение нейросетей',
      'Хранение датасетов',
    ],
    correctIndex: 1, explanation: 'MLflow Tracking записывает параметры, метрики, артефакты по каждому run.' },
  { id: 'mlops_m1', domain: 'MLOps', difficulty: 'medium',
    text: 'Что такое "model drift" в production ML?',
    options: [
      'Утечка памяти в Python процессе',
      'Деградация качества модели из-за изменения распределения входных данных',
      'Конфликт версий зависимостей',
      'Случайная инициализация весов',
    ],
    correctIndex: 1, explanation: 'Data/concept drift: p(X) или p(Y|X) изменяется со временем → качество падает без переобучения.' },
  { id: 'mlops_h1', domain: 'MLOps', difficulty: 'hard',
    text: 'Какой паттерн деплоя позволяет откатиться без даунтайма при проблеме в новой версии?',
    options: ['Blue-Green deployment', 'Rolling update', 'Canary release', 'Shadow mode'],
    correctIndex: 0, explanation: 'Blue-Green: два окружения переключаются на уровне LB; откат мгновенный переключением трафика.' },

  // ── Computer Vision ──────────────────────────────────────────────────────────
  { id: 'cv_e1', domain: 'Computer Vision', difficulty: 'easy',
    text: 'Что делает функция `cv2.resize(img, (w, h))`?',
    options: [
      'Обрезает изображение до (w, h)',
      'Масштабирует изображение до ширины w и высоты h',
      'Поворачивает на w градусов',
      'Применяет Gaussian blur с ядром (w, h)',
    ],
    correctIndex: 1, explanation: 'cv2.resize изменяет размер. Порядок: (width, height), не (rows, cols).' },
  { id: 'cv_m1', domain: 'Computer Vision', difficulty: 'medium',
    text: 'Какую архитектуру использует YOLO для детекции объектов?',
    options: [
      'Two-stage: RPN + Fast R-CNN',
      'One-stage: единая CNN предсказывает bounding boxes и классы',
      'Transformer-only: DETR без CNN backbone',
      'Graph neural network',
    ],
    correctIndex: 1, explanation: 'YOLO — one-stage детектор: single forward pass → B·S²·(5+C) предсказаний без RPN.' },
  { id: 'cv_h1', domain: 'Computer Vision', difficulty: 'hard',
    text: 'В чём преимущество Focal Loss перед BCE для задачи детекции?',
    options: [
      'Focal Loss быстрее вычисляется на GPU',
      'Focal Loss автоматически балансирует классы через label smoothing',
      'Focal Loss снижает вклад лёгких примеров (γ·(1-p)^γ), фокусируясь на сложных',
      'Focal Loss совместим только с anchor-free детекторами',
    ],
    correctIndex: 2, explanation: 'FL(p_t) = -(1−p_t)^γ·log(p_t). γ>0 снижает лёгкие примеры и фокусирует обучение на hard negatives.' },
]

const DOMAINS = ['Все области', 'Python', 'ML Engineering', 'NLP / LLM', 'MLOps', 'Computer Vision']

// ── Skill IQ algorithm ─────────────────────────────────────────────────────────
const DIFF_SCORE: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 4 }
const DIFF_NEXT: Record<string, Difficulty> = {
  'easy-correct': 'medium', 'medium-correct': 'hard', 'hard-correct': 'hard',
  'easy-wrong': 'easy', 'medium-wrong': 'easy', 'hard-wrong': 'medium',
}

function computeIQ(answers: { q: Question; correct: boolean }[]): number {
  if (!answers.length) return 0
  const total = answers.reduce((s, a) => s + DIFF_SCORE[a.q.difficulty], 0)
  const earned = answers.reduce((s, a) => s + (a.correct ? DIFF_SCORE[a.q.difficulty] : 0), 0)
  return Math.round(50 + (earned / total) * 200)
}

function percentile(iq: number) {
  if (iq >= 220) return 99
  if (iq >= 200) return 95
  if (iq >= 180) return 85
  if (iq >= 150) return 70
  if (iq >= 120) return 50
  if (iq >= 90) return 30
  return 15
}

function iqLabel(iq: number) {
  if (iq >= 220) return { text: 'Expert', color: '#F59E0B' }
  if (iq >= 190) return { text: 'Advanced', color: '#10B981' }
  if (iq >= 150) return { text: 'Proficient', color: '#22D3EE' }
  if (iq >= 110) return { text: 'Developing', color: '#818CF8' }
  return { text: 'Beginner', color: '#94A3B8' }
}

function weakZones(answers: { q: Question; correct: boolean }[]) {
  const byDomain: Record<string, { correct: number; total: number }> = {}
  answers.forEach(a => {
    if (!byDomain[a.q.domain]) byDomain[a.q.domain] = { correct: 0, total: 0 }
    byDomain[a.q.domain].total++
    if (a.correct) byDomain[a.q.domain].correct++
  })
  return Object.entries(byDomain)
    .map(([domain, s]) => ({ domain, pct: Math.round((s.correct / s.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
}

export function AdaptiveAssessment() {
  const [domain, setDomain] = useState('Все области')
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<{ q: Question; correct: boolean }[]>([])
  const [currentQ, setCurrentQ] = useState<Question | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [currentDiff, setCurrentDiff] = useState<Difficulty>('easy')
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set())
  const MAX_QUESTIONS = 10

  const pickQuestion = useCallback((diff: Difficulty, used: Set<string>, dom: string) => {
    const pool = QUESTIONS.filter(q =>
      q.difficulty === diff &&
      !used.has(q.id) &&
      (dom === 'Все области' || q.domain === dom),
    )
    if (pool.length === 0) {
      // fall back to any unused
      const any = QUESTIONS.filter(q => !used.has(q.id) && (dom === 'Все области' || q.domain === dom))
      if (!any.length) return null
      return any[Math.floor(Math.random() * any.length)]
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }, [])

  const start = () => {
    const q = pickQuestion('easy', new Set(), domain)
    if (!q) return
    setCurrentQ(q)
    setCurrentDiff('easy')
    setUsedIds(new Set([q.id]))
    setAnswers([])
    setSelected(null)
    setRevealed(false)
    setStarted(true)
  }

  const confirm = () => {
    if (selected === null || !currentQ) return
    const correct = selected === currentQ.correctIndex
    setAnswers(prev => [...prev, { q: currentQ, correct }])
    setRevealed(true)
  }

  const next = () => {
    if (!currentQ) return
    const correct = selected === currentQ.correctIndex
    const key = `${currentDiff}-${correct ? 'correct' : 'wrong'}` as keyof typeof DIFF_NEXT
    const nextDiff = DIFF_NEXT[key]
    const newUsed = new Set([...usedIds])
    const q = pickQuestion(nextDiff, newUsed, domain)
    if (!q || answers.length + 1 >= MAX_QUESTIONS) {
      setCurrentQ(null)
      setStarted(false)
      return
    }
    newUsed.add(q.id)
    setUsedIds(newUsed)
    setCurrentDiff(nextDiff)
    setCurrentQ(q)
    setSelected(null)
    setRevealed(false)
  }

  const reset = () => {
    setStarted(false)
    setAnswers([])
    setCurrentQ(null)
    setSelected(null)
    setRevealed(false)
  }

  const finished = !started && answers.length > 0
  const iq = computeIQ(answers)
  const pct = percentile(iq)
  const label = iqLabel(iq)
  const zones = weakZones(answers)
  const progress = Math.min(answers.length, MAX_QUESTIONS)

  const DIFF_COLORS: Record<Difficulty, string> = {
    easy: '#10B981', medium: '#F59E0B', hard: '#F43F5E',
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="tag">Adaptive Assessment</span>
          <span className="tag" style={{ background: 'rgba(129,140,248,.1)', color: '#818CF8', borderColor: 'rgba(129,140,248,.25)' }}>
            Skill IQ
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-1), var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8,
        }}>
          Адаптивный тест навыков
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 560, lineHeight: 1.7 }}>
          Алгоритм подстраивает сложность под ваши ответы. После 10 вопросов — Skill IQ, перцентиль и зоны роста.
        </p>
      </section>

      {/* Results */}
      {finished && (
        <>
          <div className="glass" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em' }}>Ваш результат</p>
            <p style={{ fontSize: 80, fontWeight: 900, color: label.color, letterSpacing: '-0.05em', lineHeight: 1 }}>{iq}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: label.color, marginBottom: 4 }}>{label.text}</p>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>
              Вы лучше, чем <strong style={{ color: 'var(--text-1)' }}>{pct}%</strong> участников
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={reset}
                style={{ padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                ↺ Пройти снова
              </button>
              <Link to="/forecast"
                style={{ padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                📈 Прогноз навыков →
              </Link>
            </div>
          </div>

          {/* Per-answer breakdown */}
          <div className="glass" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Детали теста
            </p>
            {answers.map((a) => (
              <div key={a.q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: a.correct ? '#10B981' : '#F43F5E', flexShrink: 0, width: 20 }}>
                  {a.correct ? '✓' : '✗'}
                </span>
                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, flexShrink: 0,
                  background: `color-mix(in srgb, ${DIFF_COLORS[a.q.difficulty]} 12%, transparent)`,
                  color: DIFF_COLORS[a.q.difficulty],
                  border: `1px solid color-mix(in srgb, ${DIFF_COLORS[a.q.difficulty]} 25%, transparent)` }}>
                  {a.q.difficulty}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>{a.q.domain}</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>+{a.correct ? DIFF_SCORE[a.q.difficulty] : 0} очков</span>
              </div>
            ))}
          </div>

          {/* Weak zones */}
          {zones.length > 0 && (
            <div className="glass" style={{ padding: '20px 22px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Зоны роста
              </p>
              {zones.map(z => (
                <div key={z.domain} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{z.domain}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: z.pct >= 70 ? '#10B981' : z.pct >= 40 ? '#F59E0B' : '#F43F5E' }}>
                      {z.pct}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${z.pct}%`,
                      background: z.pct >= 70 ? '#10B981' : z.pct >= 40 ? '#F59E0B' : '#F43F5E',
                      transition: 'width .4s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Start screen */}
      {!started && !finished && (
        <div className="glass" style={{ padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <p style={{ fontSize: 48 }}>🧠</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>
            {MAX_QUESTIONS} вопросов · адаптивная сложность · Skill IQ
          </p>

          {/* Domain selector */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setDomain(d)}
                style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                  background: domain === d ? 'var(--accent-dim)' : 'transparent',
                  color: domain === d ? 'var(--accent)' : 'var(--text-2)',
                  border: domain === d ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' : '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all .15s',
                }}>
                {d}
              </button>
            ))}
          </div>

          <button onClick={start}
            style={{ padding: '14px 36px', borderRadius: 99, fontSize: 16, fontWeight: 800, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Начать тест →
          </button>
        </div>
      )}

      {/* Question */}
      {started && currentQ && (
        <>
          {/* Progress + difficulty */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--surface-4)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 99, width: `${(progress / MAX_QUESTIONS) * 100}%`, transition: 'width .3s' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{progress}/{MAX_QUESTIONS}</span>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99,
              background: `color-mix(in srgb, ${DIFF_COLORS[currentDiff]} 12%, transparent)`,
              color: DIFF_COLORS[currentDiff],
              border: `1px solid color-mix(in srgb, ${DIFF_COLORS[currentDiff]} 25%, transparent)`,
              fontWeight: 700, flexShrink: 0 }}>
              {currentDiff}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{currentQ.domain}</span>
          </div>

          {/* Question card */}
          <div className="glass" style={{ padding: '28px 28px 20px' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.5, marginBottom: 20 }}>
              {currentQ.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentQ.options.map((opt, i) => {
                let bg = 'var(--surface-4)'
                let border = '1px solid var(--border)'
                let color = 'var(--text-1)'
                if (selected === i && !revealed) {
                  bg = 'var(--accent-dim)'; border = '1px solid color-mix(in srgb, var(--accent) 35%, transparent)'; color = 'var(--accent)'
                }
                if (revealed && i === currentQ.correctIndex) {
                  bg = 'rgba(16,185,129,.1)'; border = '1px solid rgba(16,185,129,.35)'; color = '#10B981'
                }
                if (revealed && selected === i && i !== currentQ.correctIndex) {
                  bg = 'rgba(244,63,94,.08)'; border = '1px solid rgba(244,63,94,.35)'; color = '#F43F5E'
                }
                return (
                  <button key={i} onClick={() => !revealed && setSelected(i)}
                    style={{
                      padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: 14,
                      background: bg, border, color, cursor: revealed ? 'default' : 'pointer',
                      transition: 'all .15s', fontFamily: 'inherit', lineHeight: 1.4,
                    }}>
                    <span style={{ fontSize: 12, fontWeight: 700, marginRight: 8, opacity: .6 }}>
                      {['A', 'B', 'C', 'D'][i]}.
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {revealed && (
              <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8,
                background: selected === currentQ.correctIndex ? 'rgba(16,185,129,.06)' : 'rgba(244,63,94,.05)',
                border: `1px solid ${selected === currentQ.correctIndex ? 'rgba(16,185,129,.2)' : 'rgba(244,63,94,.2)'}` }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: selected === currentQ.correctIndex ? '#10B981' : '#F43F5E', marginBottom: 4 }}>
                  {selected === currentQ.correctIndex ? '✓ Правильно!' : '✗ Неправильно'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{currentQ.explanation}</p>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {!revealed ? (
                <button onClick={confirm} disabled={selected === null}
                  style={{
                    padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 700,
                    background: selected !== null ? 'var(--accent)' : 'var(--surface-4)',
                    color: selected !== null ? '#fff' : 'var(--text-3)',
                    border: 'none', cursor: selected !== null ? 'pointer' : 'not-allowed',
                  }}>
                  Подтвердить
                </button>
              ) : (
                <button onClick={next}
                  style={{ padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {answers.length + 1 >= MAX_QUESTIONS ? 'Завершить →' : 'Следующий →'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
