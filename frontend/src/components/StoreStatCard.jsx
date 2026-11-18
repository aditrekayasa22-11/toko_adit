const tones = {
  blue: 'bg-brand-50 text-brand-700',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  sky: 'bg-sky-50 text-sky-600',
  rose: 'bg-rose-50 text-rose-600',
};

export default function StoreStatCard({ icon: Icon, label, value, hint, tone = 'blue' }) {
  return (
    <div className="store-stat-card rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_30px_rgba(24,39,75,0.07)] backdrop-blur sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
      {hint && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {hint}
        </p>
      )}
    </div>
  );
}
