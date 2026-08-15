import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { SkillsMap } from '@/pages/SkillsMap'
import { VacanciesMap } from '@/pages/VacanciesMap'
import { Trends } from '@/pages/Trends'
import { Analytics } from '@/pages/Analytics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="skills" element={<SkillsMap />} />
        <Route path="vacancies" element={<VacanciesMap />} />
        <Route path="trends" element={<Trends />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

export default App
