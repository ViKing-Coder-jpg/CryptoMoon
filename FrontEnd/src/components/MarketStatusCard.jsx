export function MarketStatusCard({
  label,
  name,
  price,
  change,
  low,
  high,
  times,
}) {
  return (
    <div className="mx-auto grid w-full max-w-4xl items-center gap-6 rounded-3xl bg-white px-8 py-8 shadow-xl lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="text-[12px] font-bold tracking-[0.24em] text-gold">
          {label}
        </div>
        <div className="mt-2 text-[26px] font-extrabold">{name}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="font-display text-[36px] font-extrabold sm:text-[48px]">
            {price}
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold text-emerald-700">
            {change}
          </span>
        </div>
        <div className="mt-4 flex gap-6 text-[13px] text-gray-600">
          <div>
            24H LOW <span className="font-semibold text-darkText">{low}</span>
          </div>
          <div>
            24H HIGH <span className="font-semibold text-darkText">{high}</span>
          </div>
        </div>
      </div>

      <div>
        <svg className="h-[180px] w-full" viewBox="0 0 420 180" fill="none">
          <path
            d="M20 150 C80 120, 120 80, 170 95 C220 110, 250 140, 290 130 C330 120, 360 70, 400 40 L400 180 L20 180 Z"
            fill="rgba(240, 180, 41, 0.15)"
          />
          <path
            d="M20 150 C80 120, 120 80, 170 95 C220 110, 250 140, 290 130 C330 120, 360 70, 400 40"
            stroke="#F0B429"
            strokeWidth="4"
          />
        </svg>
        <div className="mt-2 flex justify-between text-[12px] text-yellow-700/70">
          {times.map((time) => (
            <span key={time}>{time}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
