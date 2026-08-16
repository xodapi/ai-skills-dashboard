import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

interface TrainingModule {
  title: string
  theory: string
  audio_script: string
  exercises: Array<{
    type: 'code' | 'quiz' | 'terminal'
    question: string
    starter_code?: string
    solution?: string
    options?: string[]
    correct_answer?: string | number
  }>
}

// Training content database (можно потом вынести в API)
const TRAINING_MODULES: Record<string, TrainingModule> = {
  'Python': {
    title: 'Python для AI/ML',
    theory: `Python — основной язык для AI и ML. Ключевые концепции:
    
• **List comprehensions** — компактный синтаксис для трансформации данных
• **Generators** — ленивые вычисления для работы с большими данными
• **Type hints** — статическая типизация для читаемости кода
• **Async/await** — асинхронное программирование для I/O операций

В ML используется для data preprocessing, feature engineering, model training через библиотеки NumPy, Pandas, Scikit-learn.`,
    audio_script: 'Привет! Сегодня изучаем Python для AI и ML. Python стал стандартом в машинном обучении благодаря простому синтаксису и богатой экосистеме. Начнём с list comprehensions — это способ создавать списки в одну строку. Вместо цикла for, вы пишете квадратные скобки с выражением. Например, квадраты чисел от нуля до девяти: открывающая скобка, x в степени два, for x in range десять, закрывающая скобка. Generators работают похоже, но используют круглые скобки и возвращают элементы по запросу, экономя память. Type hints добавляют типы переменных через двоеточие — это помогает IDE подсказывать ошибки. Async await используется для параллельных задач вроде загрузки данных.',
    exercises: [
      {
        type: 'quiz',
        question: 'Какая библиотека используется для работы с табличными данными в Python?',
        options: ['NumPy', 'Pandas', 'Matplotlib', 'TensorFlow'],
        correct_answer: 1,
      },
      {
        type: 'code',
        question: 'Создайте list comprehension, который возвращает квадраты чётных чисел от 0 до 10',
        starter_code: '# Напишите list comprehension\nresult = ',
        solution: 'result = [x**2 for x in range(11) if x % 2 == 0]',
      },
      {
        type: 'terminal',
        question: 'Установите pandas и проверьте версию',
        solution: 'pip install pandas && python -c "import pandas; print(pandas.__version__)"',
      },
    ],
  },
  'PyTorch': {
    title: 'PyTorch Deep Learning',
    theory: `PyTorch — фреймворк для глубокого обучения от Meta.

• **Tensors** — многомерные массивы с GPU ускорением
• **Autograd** — автоматическое дифференцирование для backpropagation
• **nn.Module** — базовый класс для построения нейросетей
• **DataLoader** — эффективная загрузка данных батчами

Используется в research, CV, NLP. Более гибкий чем TensorFlow, но требует больше кода.`,
    audio_script: 'Изучаем PyTorch — фреймворк глубокого обучения. PyTorch создан Facebook и стал любимым инструментом исследователей. Главная абстракция — тензоры. Это многомерные массивы как в NumPy, но с поддержкой GPU. Чтобы перенести тензор на видеокарту, вызовите метод cuda или to с параметром cuda. Autograd автоматически считает градиенты. Вы строите граф вычислений, вызываете backward на loss, и PyTorch сам считает производные. nn Module — базовый класс для слоёв и моделей. Наследуйтесь от него, определяйте forward метод, и PyTorch сам создаст backward. DataLoader оборачивает датасет и возвращает батчи — это ускоряет обучение.',
    exercises: [
      {
        type: 'quiz',
        question: 'Что делает метод .backward() в PyTorch?',
        options: [
          'Переносит тензор на CPU',
          'Вычисляет градиенты через backpropagation',
          'Инициализирует веса модели',
          'Сохраняет модель на диск',
        ],
        correct_answer: 1,
      },
      {
        type: 'code',
        question: 'Создайте простой линейный слой с 10 входами и 5 выходами',
        starter_code: 'import torch.nn as nn\n\n# Создайте nn.Linear\nlayer = ',
        solution: 'layer = nn.Linear(10, 5)',
      },
    ],
  },
  'Docker': {
    title: 'Docker Containerization',
    theory: `Docker — платформа контейнеризации приложений.

• **Image** — неизменяемый шаблон с ОС и зависимостями
• **Container** — запущенный экземпляр image
• **Dockerfile** — текстовый файл с инструкциями сборки
• **docker-compose** — оркестрация multi-container приложений

В ML используется для воспроизводимости экспериментов и deployment моделей.`,
    audio_script: 'Изучаем Docker для ML проектов. Docker решает проблему "а у меня работает" — упаковывает приложение со всеми зависимостями в контейнер. Image — это шаблон. Представьте снимок операционной системы с установленным Python и библиотеками. Container — запущенный процесс из этого шаблона. Dockerfile описывает как собрать image. Начинается с FROM — базовый образ, потом RUN для команд, COPY для файлов, CMD для запуска. docker-compose управляет несколькими контейнерами — база данных, API, фронтенд. Один файл yaml и команда up — всё поднимается.',
    exercises: [
      {
        type: 'quiz',
        question: 'Какая команда создаёт image из Dockerfile?',
        options: ['docker run', 'docker build', 'docker push', 'docker pull'],
        correct_answer: 1,
      },
      {
        type: 'terminal',
        question: 'Запустите контейнер с Python 3.11 и выведите версию',
        solution: 'docker run python:3.11 python --version',
      },
    ],
  },
}

export function Trainer() {
  const { skill } = useParams<{ skill: string }>()
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises'>('theory')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [userCode, setUserCode] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const decodedSkill = skill ? decodeURIComponent(skill) : ''
  const module = TRAINING_MODULES[decodedSkill]

  useEffect(() => {
    if (module?.exercises[currentExercise]?.starter_code) {
      setUserCode(module.exercises[currentExercise].starter_code || '')
    }
    setShowSolution(false)
    setSelectedAnswer(null)
  }, [currentExercise, module])

  if (!module) {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px' }}>
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🚧</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', marginBottom: 8 }}>
            Тренажёр в разработке
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            Модуль для навыка "{decodedSkill}" скоро появится
          </p>
        </div>
      </div>
    )
  }

  const exercise = module.exercises[currentExercise]
  const progress = ((currentExercise + 1) / module.exercises.length) * 100

  // Text-to-speech simulation (в реальности нужен TTS API)
  const playAudio = () => {
    setIsPlaying(true)
    // Эмуляция: в реальности здесь вызов Web Speech API или ElevenLabs
    const utterance = new SpeechSynthesisUtterance(module.audio_script)
    utterance.lang = 'ru-RU'
    utterance.rate = 0.9
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopAudio = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  const checkAnswer = () => {
    if (exercise.type === 'quiz') {
      return selectedAnswer === exercise.correct_answer
    }
    if (exercise.type === 'code') {
      // Упрощённая проверка — в реале нужен sandbox
      return userCode.trim().includes(exercise.solution?.split('=')[1]?.trim() || '')
    }
    return false
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="tag">🎯 Интерактивный тренажёр</span>
          <span className="tag" style={{ background: 'rgba(16,185,129,.08)', color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>
            Виртуальная среда
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.6rem,4vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #F1F5F9, #10B981, #22D3EE)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {module.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 680, lineHeight: 1.7 }}>
          Теория + практические задания + аудио объяснение. Прогресс: {Math.round(progress)}%
        </p>
        
        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10B981, #22D3EE)',
            borderRadius: 99,
            transition: 'width .3s',
          }} />
        </div>
      </section>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setActiveTab('theory')}
          style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: activeTab === 'theory' ? 'rgba(34,211,238,.12)' : 'rgba(255,255,255,.03)',
            color: activeTab === 'theory' ? '#22D3EE' : 'var(--text-2)',
            border: activeTab === 'theory' ? '1px solid rgba(34,211,238,.3)' : '1px solid rgba(255,255,255,.08)',
            cursor: 'pointer', transition: 'all .2s',
          }}>
          📖 Теория
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          style={{
            padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: activeTab === 'exercises' ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.03)',
            color: activeTab === 'exercises' ? '#10B981' : 'var(--text-2)',
            border: activeTab === 'exercises' ? '1px solid rgba(16,185,129,.3)' : '1px solid rgba(255,255,255,.08)',
            cursor: 'pointer', transition: 'all .2s',
          }}>
          💪 Упражнения ({module.exercises.length})
        </button>
      </div>

      {activeTab === 'theory' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          
          {/* Theory text */}
          <div className="glass" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', marginBottom: 16 }}>Теория</h3>
            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {module.theory}
            </div>
          </div>

          {/* Audio player */}
          <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', marginBottom: 8 }}>🎧 Аудио объяснение</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                Слушайте теорию в удобном формате. Используется синтез речи.
              </p>
            </div>

            <div style={{
              padding: 20,
              background: 'rgba(34,211,238,.08)',
              border: '1px solid rgba(34,211,238,.2)',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              {!isPlaying ? (
                <button
                  onClick={playAudio}
                  className="btn-primary"
                  style={{ padding: '14px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}>
                  <span style={{ fontSize: 20 }}>▶</span>
                  Воспроизвести
                </button>
              ) : (
                <button
                  onClick={stopAudio}
                  style={{
                    padding: '14px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto',
                    background: 'rgba(244,63,94,.15)', color: '#F43F5E', border: '1px solid rgba(244,63,94,.3)',
                    borderRadius: 99, cursor: 'pointer', fontWeight: 600,
                  }}>
                  <span style={{ fontSize: 20 }}>⏸</span>
                  Остановить
                </button>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-3)', padding: 12, background: 'rgba(255,255,255,.02)', borderRadius: 8 }}>
              <strong style={{ color: 'var(--text-2)' }}>Скрипт:</strong> {module.audio_script.slice(0, 150)}...
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          
          {/* Exercise panel */}
          <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9' }}>
                  Задание {currentExercise + 1} / {module.exercises.length}
                </h3>
                <span className="tag" style={{
                  background: exercise.type === 'code' ? 'rgba(34,211,238,.1)' : exercise.type === 'quiz' ? 'rgba(245,158,11,.1)' : 'rgba(129,140,248,.1)',
                  color: exercise.type === 'code' ? '#22D3EE' : exercise.type === 'quiz' ? '#F59E0B' : '#818CF8',
                  borderColor: exercise.type === 'code' ? 'rgba(34,211,238,.3)' : exercise.type === 'quiz' ? 'rgba(245,158,11,.3)' : 'rgba(129,140,248,.3)',
                }}>
                  {exercise.type === 'code' ? '💻 Код' : exercise.type === 'quiz' ? '❓ Тест' : '⌨️ Terminal'}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{exercise.question}</p>
            </div>

            {/* Exercise UI */}
            {exercise.type === 'quiz' && exercise.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exercise.options.map((opt, i) => {
                  const isSelected = selectedAnswer === i
                  const isCorrect = i === exercise.correct_answer
                  const showResult = showSolution
                  
                  return (
                    <button key={i}
                      onClick={() => setSelectedAnswer(i)}
                      disabled={showSolution}
                      style={{
                        padding: '14px 16px', textAlign: 'left', borderRadius: 10, fontSize: 13,
                        background: showResult
                          ? (isCorrect ? 'rgba(16,185,129,.1)' : isSelected ? 'rgba(244,63,94,.1)' : 'rgba(255,255,255,.02)')
                          : (isSelected ? 'rgba(34,211,238,.1)' : 'rgba(255,255,255,.02)'),
                        border: showResult
                          ? (isCorrect ? '1px solid rgba(16,185,129,.3)' : isSelected ? '1px solid rgba(244,63,94,.3)' : '1px solid rgba(255,255,255,.06)')
                          : (isSelected ? '1px solid rgba(34,211,238,.3)' : '1px solid rgba(255,255,255,.06)'),
                        color: showResult
                          ? (isCorrect ? '#10B981' : isSelected ? '#F43F5E' : 'var(--text-2)')
                          : (isSelected ? '#22D3EE' : 'var(--text-1)'),
                        cursor: showSolution ? 'not-allowed' : 'pointer',
                        fontWeight: isSelected || isCorrect ? 600 : 400,
                      }}>
                      {opt}
                      {showResult && isCorrect && <span style={{ marginLeft: 8 }}>✓</span>}
                      {showResult && isSelected && !isCorrect && <span style={{ marginLeft: 8 }}>✗</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {exercise.type === 'code' && (
              <textarea
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                disabled={showSolution}
                style={{
                  width: '100%', minHeight: 180, padding: 16, borderRadius: 10,
                  background: 'rgba(8,12,20,.6)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,.1)',
                  fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6,
                  resize: 'vertical',
                }}
                placeholder="Введите код..."
              />
            )}

            {exercise.type === 'terminal' && (
              <div style={{
                padding: 16, borderRadius: 10, background: 'rgba(8,12,20,.8)',
                border: '1px solid rgba(34,211,238,.2)', fontFamily: 'var(--font-mono)', fontSize: 13,
              }}>
                <div style={{ color: '#10B981', marginBottom: 8 }}>$ <span style={{ color: '#64748B' }}>Введите команду в терминале</span></div>
                {showSolution && (
                  <div style={{ color: '#22D3EE' }}>$ {exercise.solution}</div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setShowSolution(true)}
                disabled={showSolution}
                className="btn-primary"
                style={{ flex: 1, opacity: showSolution ? 0.5 : 1, cursor: showSolution ? 'not-allowed' : 'pointer' }}>
                {checkAnswer() ? '✓ Правильно!' : 'Проверить'}
              </button>
              {showSolution && (
                <button
                  onClick={() => {
                    if (currentExercise < module.exercises.length - 1) {
                      setCurrentExercise(currentExercise + 1)
                    }
                  }}
                  className="btn-primary"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #10B981, #22D3EE)' }}>
                  Следующее →
                </button>
              )}
            </div>

            {showSolution && !checkAnswer() && exercise.solution && (
              <div style={{
                padding: 14, borderRadius: 10, background: 'rgba(245,158,11,.08)',
                border: '1px solid rgba(245,158,11,.2)',
              }}>
                <p style={{ fontSize: 11, color: '#F59E0B', marginBottom: 6, fontWeight: 600 }}>💡 Решение:</p>
                <code style={{ fontSize: 12, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
                  {exercise.solution}
                </code>
              </div>
            )}
          </div>

          {/* Hints panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="glass" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>💡 Подсказка</h4>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                {exercise.type === 'code' && 'Используйте автодополнение IDE. Не забудьте про отступы.'}
                {exercise.type === 'quiz' && 'Вернитесь к теории если не уверены. Правильный ответ только один.'}
                {exercise.type === 'terminal' && 'Скопируйте команду и выполните в своём терминале для практики.'}
              </p>
            </div>

            <div className="glass" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>📊 Прогресс</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {module.exercises.map((_, i) => (
                  <div key={i} style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: i === currentExercise ? 'rgba(34,211,238,.1)' : i < currentExercise ? 'rgba(16,185,129,.08)' : 'rgba(255,255,255,.02)',
                    border: i === currentExercise ? '1px solid rgba(34,211,238,.3)' : i < currentExercise ? '1px solid rgba(16,185,129,.2)' : '1px solid rgba(255,255,255,.05)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      fontSize: 10,
                      color: i === currentExercise ? '#22D3EE' : i < currentExercise ? '#10B981' : 'var(--text-3)',
                    }}>
                      {i < currentExercise ? '✓' : i === currentExercise ? '→' : '○'}
                    </span>
                    <span style={{ fontSize: 11, color: i <= currentExercise ? 'var(--text-1)' : 'var(--text-3)' }}>
                      Задание {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
