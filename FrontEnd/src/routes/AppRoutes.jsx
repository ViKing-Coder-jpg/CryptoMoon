import { Routes, Route } from 'react-router-dom'
import { Home } from '../pages/Home.jsx'
import { Predictions } from '../pages/Predictions.jsx'
import { About } from '../pages/About.jsx'
import { Dashboard } from '../pages/Dashboard.jsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/predictions" element={<Predictions />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}
