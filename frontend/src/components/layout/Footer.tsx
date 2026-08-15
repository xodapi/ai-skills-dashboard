export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-surface-4 bg-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-heading-sm text-accent-primary">AI Skills Dashboard</h3>
            <p className="body-text text-sm text-gray-400">
              Интерактивная аналитика востребованности навыков AI/ML инженеров на основе
              данных HeadHunter.ru и мировых источников вакансий.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300">Информация</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/privacy" className="hover:text-accent-primary transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-accent-primary transition-colors">
                  Использование cookies
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-accent-primary transition-colors">
                  Условия использования
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-300">Контакты</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong className="text-gray-300">Владелец сайта:</strong>
                <br />
                Богорад Сергей Борисович
              </p>
              <p>
                <strong className="text-gray-300">Email:</strong>
                <br />
                <a
                  href="mailto:sbb@bsosh3.org"
                  className="text-accent-primary hover:text-accent-hover transition-colors"
                >
                  sbb@bsosh3.org
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-surface-4 pt-6">
          <div className="flex flex-col gap-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} AI Skills Dashboard. Личный проект для портфолио.</p>
            <p>
              Используются cookies для аналитики и улучшения работы сайта.{' '}
              <a href="/cookies" className="text-accent-primary hover:underline">
                Подробнее
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
