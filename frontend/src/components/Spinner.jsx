import { Loader2 } from 'lucide-react';

export default function Spinner({ className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-400 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-500">Memuat Fashion Store...</p>
    </div>
  );
}
