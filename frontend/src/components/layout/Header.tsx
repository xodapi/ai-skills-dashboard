import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Skills Map', href: '/skills' },
  { name: 'Vacancies', href: '/vacancies' },
  { name: 'Trends', href: '/trends' },
  { name: 'Analytics', href: '/analytics' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-surface-4 bg-surface-2/95 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="display-text text-heading-md text-accent-primary transition-colors hover:text-accent-hover"
            >
              AI Skills
            </Link>
            <div className="hidden md:flex md:gap-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'body-text px-3 py-2 transition-colors rounded-lg',
                      isActive
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : 'text-gray-300 hover:text-accent-primary hover:bg-surface-4'
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-400">
              Real-time AI Skills Analytics
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
}
