export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Hero section */}
        <section className="space-y-4">
          <h1 className="display-text text-display-md text-accent-primary">
            AI Skills Analytics
          </h1>
          <p className="body-text text-lg text-gray-300 max-w-3xl">
            Интерактивный дашборд для мониторинга востребованности навыков AI/ML инженеров
            на основе данных HeadHunter.ru и мировых источников вакансий в режиме реального
            времени.
          </p>
        </section>

        {/* Stats grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Всего вакансий', value: '12,847', change: '+12.5%' },
            { label: 'Отслеживаемых навыков', value: '387', change: '+8 новых' },
            { label: 'Источников данных', value: '5', change: 'HH, LinkedIn, Indeed' },
            { label: 'Обновлено', value: '15 мин назад', change: 'Real-time' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-surface-3 p-6 shadow-card transition-transform hover:scale-105"
            >
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="mt-2 text-heading-lg text-accent-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-accent-muted">{stat.change}</p>
            </div>
          ))}
        </section>

        {/* Chart placeholder */}
        <section className="space-y-4">
          <h2 className="text-heading-md text-gray-100">Топ-10 востребованных навыков</h2>
          <div className="rounded-lg bg-surface-3 p-8 shadow-card">
            <div className="flex h-64 items-center justify-center text-gray-500">
              [Chart will be rendered here]
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
