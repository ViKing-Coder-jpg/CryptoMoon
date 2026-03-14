import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Predictions', to: '/predictions' },
  { label: 'About', to: '/about' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-black/5 bg-cream/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold tracking-[0.16em]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-black text-darkText shadow-[0_8px_16px_rgba(240,180,41,0.35)]">
              B
            </div>
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
            <NavLink to="/" className="text-darkText hover:text-gray-600">
              Sign In
            </NavLink>
            <button className="rounded-full bg-gold px-5 py-2.5 text-darkText shadow-[0_12px_24px_rgba(240,180,41,0.35)]">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
