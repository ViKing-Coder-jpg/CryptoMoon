import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import logo from '../assets/cryptomoon-logo.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Predictions', to: '/predictions' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'About', to: '/about' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-amber-200/60 bg-amber-50/90 shadow-[0_4px_24px_rgba(240,180,41,0.12)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.img
                src={logo}
                alt="CryptoMoon logo"
                className="h-11 w-11 object-contain"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className="text-[13px] font-bold tracking-[0.18em] text-amber-900">CRYPTOMOON</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-7 md:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative text-[14px] font-medium transition-colors ${
                      isActive ? 'text-amber-700' : 'text-amber-800/60 hover:text-amber-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-3">
              <Link to="/predictions" className="hidden md:block">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 12px 28px rgba(240,180,41,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2.5 text-sm font-bold text-amber-900 shadow-[0_6px_18px_rgba(240,180,41,0.28)]"
                >
                  Get Started
                </motion.button>
              </Link>

              {/* Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(v => !v)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-white/70 text-amber-700"
              >
                {mobileOpen ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[73px] z-40 border-b border-amber-200/60 bg-amber-50/95 backdrop-blur-xl px-6 pb-6 shadow-[0_20px_40px_rgba(240,180,41,0.12)] md:hidden"
          >
            <div className="flex flex-col gap-2 pt-4">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-amber-700/70 hover:bg-amber-50 hover:text-amber-800'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <Link to="/predictions" onClick={() => setMobileOpen(false)}>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.07 }}
                  className="mt-2 w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-3 text-sm font-bold text-amber-900"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
