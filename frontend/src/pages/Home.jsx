import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Backpack,
  Boxes,
  Footprints,
  Headphones,
  Layers,
  Package,
  Shirt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Watch,
} from 'lucide-react';
import api, { formatNumber } from '../lib/api';
import ProductCard from '../components/ProductCard';
import StoreStatCard from '../components/StoreStatCard';

const kategoriIkon = {
  Atasan: Shirt,
  Bawahan: Layers,
  Sepatu: Footprints,
  Tas: Backpack,
  Aksesoris: Watch,
  Perawatan: Sparkles,
};

const layanan = [
  { icon: Truck, title: 'Gratis ongkir', desc: 'Minimal belanja Rp300.000' },
  { icon: ShieldCheck, title: 'Pembayaran aman', desc: 'Transfer, QRIS, COD, e-wallet' },
  { icon: Headphones, title: 'CS siap membantu', desc: 'Setiap hari, 08.00 - 20.00' },
];

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="aspect-square bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3.5 w-3/4 rounded bg-slate-100" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function Home() {
  const [produk, setProduk] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [totalProduk, setTotalProduk] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    Promise.all([
      api.get('/kategori'),
      api.get('/produk', { params: { sort: 'terbaru', per_page: 12 } }),
    ])
      .then(([kategoriRes, produkRes]) => {
        if (!aktif) return;
        setKategori(kategoriRes.data.data || []);
        setTotalProduk(
          kategoriRes.data.total_produk ??
            (kategoriRes.data.data || []).reduce((total, item) => total + item.jumlah, 0)
        );
        setProduk(produkRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => aktif && setLoading(false));

    return () => {
      aktif = false;
    };
  }, []);

  const totalStok = produk.reduce((total, item) => total + (item.stok || 0), 0);
  const totalTerjual = produk.reduce((total, item) => total + (item.terjual || 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="store-welcome relative isolate mb-6 overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-xl sm:px-9 sm:py-9">
        <div className="store-welcome-shape" />
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-rose-100"><Sparkles className="h-3.5 w-3.5" /> Koleksi pilihan Toko Adit</span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">Tampil percaya diri,<br className="hidden sm:block" /> mulai dari gaya yang tepat.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-rose-50/75">Temukan fashion dan aksesori pilihan dengan pengalaman belanja yang mudah dan nyaman.</p>
          </div>
          <Link to="/produk" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-rose-50">Jelajahi koleksi <ArrowRight className="h-4 w-4 text-brand-600" /></Link>
        </div>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan katalog dan produk terbaru Toko Adit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/keranjang" className="btn-outline px-3.5 py-2 text-xs">
            Keranjang Belanja
          </Link>
          <Link
            to="/produk"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4b1830] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#351021]"
          >
            Lihat Katalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StoreStatCard
          icon={Package}
          label="Total Produk"
          value={formatNumber(totalProduk)}
          hint="Produk aktif di katalog"
          tone="blue"
        />
        <StoreStatCard
          icon={Layers}
          label="Kategori"
          value={formatNumber(kategori.length)}
          hint="Kelompok produk tersedia"
          tone="emerald"
        />
        <StoreStatCard
          icon={TrendingUp}
          label="Terjual"
          value={formatNumber(totalTerjual)}
          hint="Akumulasi produk terbaru"
          tone="amber"
        />
        <StoreStatCard
          icon={Boxes}
          label="Stok Tersedia"
          value={formatNumber(totalStok)}
          hint="Siap dikirim hari ini"
          tone="violet"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Produk Terbaru</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Pilih produk, masukkan ke keranjang, lalu lakukan checkout.
            </p>
          </div>
          <Link
            to="/produk"
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 sm:self-auto"
          >
            Semua Produk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3 no-scrollbar sm:px-5">
          <Link
            to="/produk"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#4b1830] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#351021]"
          >
            <Package className="h-4 w-4" /> Semua
          </Link>
          {kategori.map((item) => {
            const Icon = kategoriIkon[item.kategori] || Sparkles;
            return (
              <Link
                key={item.kategori}
                to={`/produk?kategori=${encodeURIComponent(item.kategori)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                <Icon className="h-4 w-4" />
                {item.kategori}
                <span className="text-[11px] font-normal text-slate-400">{item.jumlah}</span>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 12 }).map((_, index) => <ProductSkeleton key={index} />)
            : produk.map((item) => <ProductCard key={item.id_produk} product={item} />)}
        </div>

        {!loading && produk.length === 0 && (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-slate-500">Belum ada produk yang tersedia.</p>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-400">
            Menampilkan {formatNumber(produk.length)} produk terbaru
          </p>
          <Link
            to="/produk"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Lihat seluruh katalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:grid-cols-3">
        {layanan.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
