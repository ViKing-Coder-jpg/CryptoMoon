export function Dashboard() {
  return (
    <main className="py-16">
      <section className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <span className="inline-flex items-center rounded-full border border-yellow-200 px-4 py-2 text-[11px] font-bold tracking-[0.24em] text-yellow-700">
            DASHBOARD
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-darkText sm:text-4xl">
            Real-Time Market Control Center
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Monitor live signals, volatility heatmaps, and portfolio risk summaries in one unified cockpit.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-gold/40 bg-cream px-6 py-10 text-center text-sm text-gray-600">
            Dashboard widgets are under construction. Stay tuned for the full suite.
          </div>
        </div>
      </section>
    </main>
  )
}
