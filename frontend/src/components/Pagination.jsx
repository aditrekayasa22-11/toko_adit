import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onChange, className = '' }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page: current, last_page: last } = meta;

  return (
    <div className={`flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}>
      <p className="text-sm text-slate-500">
        Halaman <span className="font-semibold text-slate-700">{current}</span> dari{' '}
        <span className="font-semibold text-slate-700">{last}</span>
        {meta.total !== undefined && (
          <span className="text-slate-400"> · {meta.total} data</span>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-outline px-3 py-2"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </button>
        <button
          type="button"
          className="btn-outline px-3 py-2"
          disabled={current >= last}
          onClick={() => onChange(current + 1)}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
