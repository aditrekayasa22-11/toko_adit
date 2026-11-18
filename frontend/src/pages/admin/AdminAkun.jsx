import { useCallback, useEffect, useState } from 'react';
import { Loader2, Search, ShieldCheck, UserRoundCog } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDateTime } from '../../lib/api';
import Pagination from '../../components/Pagination';

export default function AdminAkun() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/akun', { params: { search: search || undefined, page } });
      setRows(data.data || []);
      setMeta(data.meta || null);
    } catch (error) { toast.error(apiError(error)); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);

  return <div className="space-y-5">
    <div><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Data Admin</h2><p className="mt-1 text-sm text-slate-500">Akun yang memiliki akses ke panel admin dan meja kasir.</p></div>
    <section className="card overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h3 className="font-bold text-slate-900">Daftar akun</h3><p className="mt-1 text-xs text-slate-400">{meta?.total || 0} akun terdaftar</p></div><div className="relative sm:w-72"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="input pl-9" placeholder="Cari nama atau email" /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Peran</th><th className="px-5 py-3">Terdaftar</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Memuat akun...</td></tr> : rows.map((item) => <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><span className="flex items-center gap-2.5 font-semibold text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500">{item.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <UserRoundCog className="h-4 w-4" />}</span>{item.name}</span></td><td className="px-5 py-4 text-slate-500">{item.email}</td><td className="px-5 py-4"><span className={`badge ${item.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-blue-50 text-blue-700'}`}>{item.role === 'admin' ? 'Administrator' : 'Kasir'}</span></td><td className="px-5 py-4 text-xs text-slate-500">{item.created_at ? formatDateTime(item.created_at) : '—'}</td></tr>)}{!loading && rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Akun tidak ditemukan.</td></tr>}</tbody></table></div><Pagination meta={meta} onChange={setPage} className="p-4 sm:px-5" /></section>
  </div>;
}
