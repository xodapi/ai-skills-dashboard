import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

const API = '/api/v1'

interface Exercise {
  type: 'code' | 'quiz' | 'terminal'
  title?: string
  description?: string
  question?: string
  starter_code?: string
  solution?: string
  options?: string[]
  correct?: number
  explanation?: string
  command?: string
  expected_output?: string
  test_cases?: Array<{ input: string; expected: string }>
}

interface TrainingModule {
  title: string
  icon: string
  level: string
  theory: string
  exercises: Exercise[]
}

// Simple markdown parser
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent); font-weight: 700;">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(var(--accent-rgb),.15); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; color: var(--accent);">$1</code>')
    .replace(/^• (.+)$/gm, '<div style="padding-left: 20px; margin: 6px 0;">• $1</div>')
    .replace(/\n\n/g, '<br><br>')
}

export default function Trainer() {
  const { skill } = useParams<{ skill: string }>()
  const { token } = useAuth()
  const qc = useQueryClient()
  
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises'>('theory')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [userCode, setUserCode] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)

  // Progress tracking mutation
  const progressMutation = useMutation({
    mutationFn: (exerciseId: string) =>
      fetch(`${API}/users/me/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ module: skill, exercise_id: exerciseId }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-progress'] }),
  })

  // Fetch module from API
  useEffect(() => {
    async function fetchModule() {
      if (!skill) return
      
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/training/modules/${skill}`)
        
        if (!response.ok) {
          throw new Error(`Module "${skill}" not found`)
        }
        
        const data = await response.json()
        setModule(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load module')
      } finally {
        setLoading(false)
      }
    }

    fetchModule()
  }, [skill])

  // Reset exercise state when changing exercise
  useEffect(() => {
    if (module?.exercises[currentExercise]) {
      const ex = module.exercises[currentExercise]
      setUserCode(ex.starter_code || '')
      setShowSolution(false)
      setSelectedAnswer(null)
    }
  }, [currentExercise, module])

  if (loading) {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: 'var(--text-2)', fontSize: '16px' }}>Загрузка модуля...</div>
      </div>
    )
  }

  if (error || !module) {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '60px 24px' }}>
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-1)', marginBottom: '12px' }}>
            Модуль не найден
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
            {error || `Тренажёр для "${skill}" пока недоступен`}
          </p>
          <Link to="/gap-analyzer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            ← Вернуться к анализу пробелов
          </Link>
        </div>
      </div>
    )
  }

  const exercise = module.exercises[currentExercise]
  const progress = ((currentExercise + 1) / module.exercises.length) * 100

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>{module.icon}</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-1)' }}>
            {module.title}
          </h1>
          <span style={{
            padding: '4px 12px',
            background: 'rgba(var(--accent-rgb), 0.15)',
            color: 'var(--accent)',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            {module.level}
          </span>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Реальные задания из вакансий + интерактивные упражнения
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--surface-2)' }}>
        <button
          onClick={() => setActiveTab('theory')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'theory' ? 'var(--surface-2)' : 'transparent',
            color: activeTab === 'theory' ? 'var(--text-1)' : 'var(--text-2)',
            border: 'none',
            borderBottom: activeTab === 'theory' ? '2px solid var(--accent)' : 'none',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📚 Теория
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'exercises' ? 'var(--surface-2)' : 'transparent',
            color: activeTab === 'exercises' ? 'var(--text-1)' : 'var(--text-2)',
            border: 'none',
            borderBottom: activeTab === 'exercises' ? '2px solid var(--accent)' : 'none',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💪 Упражнения ({module.exercises.length})
        </button>
      </div>

      {/* Theory Tab */}
      {activeTab === 'theory' && (
        <div className="glass" style={{ padding: 40 }}>
          <div 
            style={{ 
              fontSize: 15, 
              lineHeight: 1.8, 
              color: '#CBD5E1'
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(module.theory) }}
          />
        </div>
      )}

      {/* Exercises Tab */}
      {activeTab === 'exercises' && (
        <div>
          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>
                Упражнение {currentExercise + 1} из {module.exercises.length}
              </span>
              <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ 
              height: 8, 
              background: 'var(--surface-2)', 
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Exercise Card */}
          <div className="glass" style={{ padding: 40 }}>
            {/* Exercise Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>
                  {exercise.type === 'quiz' && '❓'}
                  {exercise.type === 'code' && '💻'}
                  {exercise.type === 'terminal' && '⚡'}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>
                  {exercise.title || exercise.question || `Задание ${currentExercise + 1}`}
                </h3>
              </div>
              {exercise.description && (
                <p 
                  style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(exercise.description) }}
                />
              )}
            </div>

            {/* Quiz Exercise */}
            {exercise.type === 'quiz' && exercise.options && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {exercise.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(idx)}
                      style={{
                        padding: '16px 20px',
                        background: selectedAnswer === idx 
                          ? (showSolution 
                            ? (idx === exercise.correct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                            : 'var(--surface-3)')
                          : 'var(--surface-2)',
                        border: selectedAnswer === idx 
                          ? (showSolution
                            ? (idx === exercise.correct ? '2px solid #22C55E' : '2px solid #EF4444')
                            : '2px solid var(--accent)')
                          : '1px solid var(--surface-3)',
                        borderRadius: 12,
                        color: 'var(--text-1)',
                        fontSize: 15,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 600, marginRight: 12, color: 'var(--accent)' }}>
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>

                {showSolution && exercise.explanation && (
                  <div style={{
                    marginTop: 20,
                    padding: 16,
                    background: 'rgba(var(--accent-rgb), 0.1)',
                    border: '1px solid var(--accent)',
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                      💡 Объяснение:
                    </div>
                    <div style={{ fontSize: 14, color: '#E2E8F0', lineHeight: 1.6 }}>
                      {exercise.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Code Exercise */}
            {exercise.type === 'code' && (
              <div style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                    Ваш код:
                  </label>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 200,
                    padding: 16,
                    background: 'var(--surface-1)',
                    border: '1px solid var(--surface-3)',
                    borderRadius: 8,
                    color: 'var(--text-1)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    resize: 'vertical'
                  }}
                  spellCheck={false}
                />

                {showSolution && exercise.solution && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                      ✅ Решение:
                    </div>
                    <pre style={{
                      padding: 16,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--accent)',
                      borderRadius: 8,
                      color: '#E2E8F0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      overflow: 'auto'
                    }}>
                      {exercise.solution}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Terminal Exercise */}
            {exercise.type === 'terminal' && (
              <div style={{ marginTop: 24 }}>
                {exercise.command && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
                      Команда:
                    </div>
                    <pre style={{
                      padding: 16,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--surface-3)',
                      borderRadius: 8,
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      overflow: 'auto'
                    }}>
                      {exercise.command}
                    </pre>
                  </div>
                )}

                {showSolution && exercise.expected_output && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
                      Ожидаемый результат:
                    </div>
                    <pre style={{
                      padding: 16,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--accent)',
                      borderRadius: 8,
                      color: '#E2E8F0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      overflow: 'auto'
                    }}>
                      {exercise.expected_output}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              {!showSolution && (
                <button
                  onClick={() => setShowSolution(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--accent)',
                    color: 'var(--surface-1)',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  Показать решение
                </button>
              )}

              {currentExercise < module.exercises.length - 1 && (
                <button
                  onClick={() => {
                    // Track progress if authenticated
                    if (token) {
                      progressMutation.mutate(`ex-${currentExercise}`)
                    }
                    setCurrentExercise(currentExercise + 1)
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--surface-3)',
                    color: 'var(--text-1)',
                    border: '1px solid var(--surface-4)',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  Следующее упражнение →
                </button>
              )}

              {currentExercise === module.exercises.length - 1 && (
                <button
                  onClick={() => {
                    // Track final exercise
                    if (token) {
                      progressMutation.mutate(`ex-${currentExercise}`)
                    }
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    marginRight: 12,
                  }}
                >
                  ✓ Завершить модуль
                </button>
              )}

              {currentExercise === module.exercises.length - 1 && (
                <Link
                  to="/gap-analyzer"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-bright))',
                    color: 'var(--surface-1)',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🎉 Завершить модуль
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
