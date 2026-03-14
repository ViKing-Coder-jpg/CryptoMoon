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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a9 9 0 0 0 0 18" />
              </svg>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="5" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 3.9" />
                <path d="M15.4 6.6L8.6 10.5" />
              </svg>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
