import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <p className="text-[110px] font-extrabold leading-none tracking-tighter text-brand-100">
          404
        </p>
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
          <ShoppingBag className="h-8 w-8" />
        </span>
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia lagi.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
        <Link to="/produk" className="btn-outline">
          Lihat Produk
        </Link>
      </div>
    </div>
  );
}
