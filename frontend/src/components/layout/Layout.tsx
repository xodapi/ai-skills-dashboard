import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsent } from '@/components/ui/CookieConsent'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
