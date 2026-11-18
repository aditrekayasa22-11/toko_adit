import { useEffect, useState } from 'react';
import { ArrowUpRight, Loader2, Package, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { apiError } from '../../lib/api';

export default function AdminKategori() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/kategori')
      .then(({ data }) => { setRows(data.data || []); setTotal(data.total_produk || 0); })
      .catch((error) => toast.error(apiError(error)))
      .finally(() => setLoading(false));
  }, []);

  return <div className="space-y-5">
    <div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Data Kategori</h2><p className="mt-1 text-sm text-slate-500">Kategori diringkas dari produk yang sudah dibuat di katalog.</p></div>
    <div className="grid gap-3 sm:grid-cols-2"><div className="card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Tags className="h-5 w-5" /></span><div><p className="text-xs text-slate-500">Kategori aktif</p><p className="text-xl font-extrabold text-slate-900">{rows.length}</p></div></div><div className="card flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Package className="h-5 w-5" /></span><div><p className="text-xs text-slate-500">Produk terdata</p><p className="text-xl font-extrabold text-slate-900">{total}</p></div></div></div>
    <section className="card overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Daftar kategori</h3></div><div className="divide-y divide-slate-100">{loading ? <div className="p-10 text-center text-sm text-slate-400"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Memuat kategori...</div> : rows.map((row) => <div key={row.kategori} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500"><Tags className="h-4 w-4" /></span><div><p className="font-semibold text-slate-800">{row.kategori}</p><p className="text-xs text-slate-400">Kategori produk</p></div></div><div className="flex items-center gap-3"><span className="badge bg-slate-100 text-slate-600">{row.jumlah} produk</span><Link to="/admin/produk" className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700" title="Kelola produk"><ArrowUpRight className="h-4 w-4" /></Link></div></div>)}{!loading && rows.length === 0 && <p className="p-10 text-center text-sm text-slate-400">Belum ada kategori. Tambahkan produk untuk memulai.</p>}</div><div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">Kategori baru dibuat saat menambah atau mengubah produk di halaman Data Produk.</div></section>
  </div>;
}
