import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatNumber, formatRupiah } from '../../lib/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

const formatSingkat = (nilai) => {
  if (nilai >= 1000000) return `${(nilai / 1000000).toFixed(1)}jt`;
  if (nilai >= 1000) return `${Math.round(nilai / 1000)}rb`;
  return String(nilai);
};

function TooltipChart({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-soft">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">
        {formatRupiah(payload[0].value)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;
    api
      .get('/admin/dashboard')
      .then(({ data: result }) => aktif && setData(result))
      .catch((error) => toast.error(apiError(error)))
      .finally(() => aktif && setLoading(false));

    return () => {
      aktif = false;
    };
  }, []);

  if (loading) return <Spinner className="min-h-[60vh]" label="Memuat dashboard..." />;
  if (!data) return null;

  const maxTerlaris = Math.max(...(data.produk_terlaris.map((item) => item.terjual) || [1]), 1);

  return (
    <div className="space-y-5">
      <section className="admin-welcome relative isolate overflow-hidden rounded-[26px] p-6 text-white shadow-xl sm:p-8">
        <div className="admin-welcome-orb admin-welcome-orb-one" />
        <div className="admin-welcome-orb admin-welcome-orb-two" />
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-orange-100"><TrendingUp className="h-3.5 w-3.5" /> Ringkasan Fashion Store</span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Selamat datang kembali!</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50/75">Pantau performa penjualan, kelola produk, dan ikuti aktivitas terbaru toko dalam satu tempat.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to="/admin/produk" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"><Plus className="h-4 w-4" /> Kelola Produk</Link>
            <Link to="/admin/laporan" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-lg transition hover:bg-orange-50"><BarChart3 className="h-4 w-4 text-brand-600" /> Lihat Laporan</Link>
          </div>
        </div>
      </section>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Selamat datang kembali! 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan performa toko dan aktivitas terbaru Fashion Store.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/produk" className="btn-outline px-3 py-2 text-xs">
            <Plus className="h-4 w-4" /> Kelola Produk
          </Link>
          <Link to="/admin/laporan" className="btn-primary px-3 py-2 text-xs">
            <BarChart3 className="h-4 w-4" /> Lihat Laporan
          </Link>
        </div>
      </div>

      {data.pesanan_pending > 0 && (
        <Link
          to="/admin/pesanan"
          className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100/70"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-amber-800">
              {data.pesanan_pending} pesanan menunggu konfirmasi
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-700" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total Pendapatan"
          value={formatRupiah(data.total_omzet)}
          hint={`${formatNumber(data.total_transaksi)} transaksi tercatat`}
          tone="brand"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Transaksi"
          value={formatNumber(data.total_transaksi)}
          hint="Transaksi penjualan selesai"
          tone="emerald"
        />
        <StatCard
          icon={Users}
          label="Total Pelanggan"
          value={formatNumber(data.total_pelanggan)}
          hint={`${formatNumber(data.pesanan_total)} pesanan online`}
          tone="sky"
        />
        <StatCard
          icon={Package}
          label="Total Produk"
          value={formatNumber(data.total_produk)}
          hint={`${data.stok_menipis.length} produk stok menipis`}
          tone="violet"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Grafik Penjualan</h3>
              <p className="mt-0.5 text-xs text-slate-400">Pendapatan 14 hari terakhir</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" /> Data real-time
            </span>
          </div>

          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.grafik_penjualan} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="warnaGrafik" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8d294b" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#8d294b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={formatSingkat}
                  width={58}
                />
                <Tooltip content={<TooltipChart />} cursor={{ stroke: '#fdba74', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8d294b"
                  strokeWidth={2.5}
                  fill="url(#warnaGrafik)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#8d294b', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Produk Terlaris</h3>
            <Link to="/admin/laporan" className="text-xs font-semibold text-brand-600">
              Detail
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            {data.produk_terlaris.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada penjualan.</p>
            )}
            {data.produk_terlaris.map((item, index) => (
              <div key={item.nama_produk}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[10px] font-bold text-brand-700">
                      {index + 1}
                    </span>
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {item.nama_produk}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-slate-500">
                    {item.terjual} pcs
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400"
                    style={{ width: `${Math.max(8, (item.terjual / maxTerlaris) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
            <Link
              to="/admin/transaksi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
            >
              Lihat semua <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3 font-semibold">Produk</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.transaksi_terbaru.map((item) => (
                  <tr key={item.id_transaksi} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-700">{item.nama_pelanggan}</p>
                      <p className="text-[11px] text-slate-400">TRX-{item.id_transaksi}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-600">{item.nama_produk}</p>
                      <p className="text-[11px] text-slate-400">{item.jumlah} pcs</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {formatDate(item.tanggal_transaksi, { month: 'short' })}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-slate-800">
                      {formatRupiah(item.total_harga)}
                    </td>
                  </tr>
                ))}
                {data.transaksi_terbaru.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Stok Menipis</h3>
              <Link to="/admin/produk" className="text-xs font-semibold text-brand-600">
                Kelola
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {data.stok_menipis.length === 0 && (
                <p className="text-sm text-slate-400">Semua stok aman.</p>
              )}
              {data.stok_menipis.map((item) => (
                <div
                  key={item.id_produk}
                  className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {item.nama_produk}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.kategori}</p>
                  </div>
                  <span
                    className={`badge shrink-0 ${
                      item.stok === 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.stok} pcs
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Pesanan Terbaru</h3>
              <Link to="/admin/pesanan" className="text-xs font-semibold text-brand-600">
                Lihat
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {data.pesanan_terbaru.length === 0 && (
                <p className="text-sm text-slate-400">Belum ada pesanan online.</p>
              )}
              {data.pesanan_terbaru.map((item) => (
                <div key={item.id_pesanan} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700">{item.kode_pesanan}</p>
                    <StatusBadge status={item.status} className="text-[10px]" />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{item.nama_pelanggan}</span>
                    <span className="font-semibold text-slate-600">
                      {formatRupiah(item.total_harga)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
