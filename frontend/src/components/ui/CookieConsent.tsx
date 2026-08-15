import { useState, useEffect } from 'react'
import clsx from 'clsx'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const newPreferences = { necessary: true, analytics: true }
    setPreferences(newPreferences)
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
    setIsVisible(false)
  }

  const handleAcceptNecessary = () => {
    const newPreferences = { necessary: true, analytics: false }
    setPreferences(newPreferences)
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-lg border border-surface-4 bg-surface-2 p-6 shadow-elevated">
        <div className="space-y-4">
          <h3 className="text-heading-sm text-accent-primary">
            Этот сайт использует cookies
          </h3>
          <p className="body-text text-sm text-gray-300">
            Мы используем cookies для обеспечения работы сайта и анализа посещаемости. Вы
            можете принять все cookies или выбрать только необходимые для работы сайта.
          </p>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.necessary}
                disabled
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-300">
                <strong>Необходимые cookies</strong> — требуются для работы сайта
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 accent-accent-primary"
              />
              <span className="text-sm text-gray-300">
                <strong>Аналитические cookies</strong> — помогают улучшить сайт
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={handleAcceptNecessary}
              className={clsx(
                'rounded-pill px-6 py-2 text-sm font-medium transition-colors',
                'border border-surface-4 text-gray-300 hover:bg-surface-4'
              )}
            >
              Только необходимые
            </button>
            <button
              onClick={handleAcceptAll}
              className={clsx(
                'rounded-pill px-6 py-2 text-sm font-medium transition-colors',
                'bg-accent-primary text-surface-1 hover:bg-accent-hover'
              )}
            >
              Принять все
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Подробнее о использовании cookies читайте в{' '}
            <a href="/cookies" className="text-accent-primary hover:underline">
              политике cookies
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
