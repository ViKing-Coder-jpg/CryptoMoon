import { FiGlobe, FiMail, FiShare2 } from 'react-icons/fi'

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid items-center gap-6 py-8 text-center text-sm text-gray-600 md:grid-cols-[1fr_2fr_1fr] md:text-left">
          <div className="flex items-center justify-center gap-2 font-bold tracking-[0.16em] md:justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-[12px] font-black text-darkText">
              B
            </div>
            <span className="text-[13px]">CRYPTOMOON</span>
          </div>
          <div className="text-center">© 2024 CryptoMoon Predictive Labs. All rights reserved.</div>
          <div className="flex items-center justify-center gap-4 text-gold md:justify-end">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
              <FiGlobe className="h-4 w-4" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
              <FiShare2 className="h-4 w-4" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
              <FiMail className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
