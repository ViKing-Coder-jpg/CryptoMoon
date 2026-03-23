import { NavLink ,Link} from 'react-router-dom'
import logo from '../assets/cryptomoon-logo.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Predictions', to: '/predictions' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'About', to: '/about' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 font-bold tracking-[0.16em]">
            <img
              src={logo}
              alt="CryptoMoon logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-[13px]">CRYPTOMOON</span>
          </div>

          <div className="hidden items-center gap-7 text-[15px] font-medium text-gray-600 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `border-b-2 pb-1 transition ${
                    isActive
                      ? 'border-gold text-darkText'
                      : 'border-transparent text-gray-600 hover:text-darkText'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to='/predictions'><button className="rounded-full bg-gold px-5 py-2.5 text-darkText shadow-[0_12px_24px_rgba(240,180,41,0.35)]">
              Get Started
            </button></Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
