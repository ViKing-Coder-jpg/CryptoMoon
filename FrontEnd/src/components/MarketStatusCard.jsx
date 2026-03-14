const sparkBars = [
  'h-8',
  'h-10',
  'h-14',
  'h-9',
  'h-12',
  'h-16',
  'h-12',
  'h-20',
  'h-24',
  'h-28',
]

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
        <div className="flex h-[180px] items-end justify-between gap-1 rounded-xl bg-[#FEFBF0] px-3 pb-6">
          {sparkBars.map((height, index) => (
            <div
              key={`spark-${height}-${index}`}
              className={`w-3 rounded-full bg-[#F0B429] ${height} ${
                index % 2 === 0 ? 'opacity-60' : 'opacity-90'
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-yellow-700/70">
          {times.map((time) => (
            <span key={time}>{time}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
