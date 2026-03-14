import { BrowserRouter } from 'react-router-dom'
import { Navbar } from './components/Navbar.jsx'
import { Footer } from './components/Footer.jsx'
import { AppRoutes } from './routes/AppRoutes.jsx'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream text-darkText">
        <Navbar />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  )
}
