const statusMap = {
  pending: { label: 'Menunggu Konfirmasi', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  diproses: { label: 'Diproses', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
  dikirim: { label: 'Dikirim', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
  selesai: { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  dibatalkan: { label: 'Dibatalkan', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

export default function StatusBadge({ status, className = '' }) {
  const meta = statusMap[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
