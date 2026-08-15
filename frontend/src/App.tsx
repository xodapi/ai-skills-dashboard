import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { SkillsMap } from '@/pages/SkillsMap'
import { SkillSets } from '@/pages/SkillSets'
import { VacanciesMap } from '@/pages/VacanciesMap'
import { WorldMap } from '@/pages/WorldMap'
import { Trends } from '@/pages/Trends'
import { Analytics } from '@/pages/Analytics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="skills" element={<SkillsMap />} />
        <Route path="skillsets" element={<SkillSets />} />
        <Route path="vacancies" element={<VacanciesMap />} />
        <Route path="worldmap" element={<WorldMap />} />
        <Route path="trends" element={<Trends />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

export default App
