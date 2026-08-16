import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { SkillsMap } from '@/pages/SkillsMap'
import { SkillSets } from '@/pages/SkillSets'
import { VacanciesMap } from '@/pages/VacanciesMap'
import { WorldMap } from '@/pages/WorldMap'
import { Trends } from '@/pages/Trends'
import { Analytics } from '@/pages/Analytics'
import { Radar } from '@/pages/Radar'
import { GapAnalyzer } from '@/pages/GapAnalyzer'
import Trainer from '@/pages/Trainer'
import { Discovery } from '@/pages/Discovery'
import { SalaryCalculator } from '@/pages/SalaryCalculator'
import { RoleRoadmap } from '@/pages/RoleRoadmap'
import { AdaptiveAssessment } from '@/pages/AdaptiveAssessment'
import { SkillsForecast } from '@/pages/SkillsForecast'

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
        <Route path="radar" element={<Radar />} />
        <Route path="gap-analyzer" element={<GapAnalyzer />} />
        <Route path="discovery" element={<Discovery />} />
        <Route path="trainer/:skill" element={<Trainer />} />
        <Route path="salary-calculator" element={<SalaryCalculator />} />
        <Route path="roadmap" element={<RoleRoadmap />} />
        <Route path="assessment" element={<AdaptiveAssessment />} />
        <Route path="forecast" element={<SkillsForecast />} />
      </Route>
    </Routes>
  )
}

export default App
