import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronRight,
  Home,
  Minus,
  PackageSearch,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatNumber, formatRupiah, productImage } from '../lib/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

export default function ProdukDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [produk, setProduk] = useState(null);
  const [terkait, setTerkait] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jumlah, setJumlah] = useState(1);

  useEffect(() => {
    let aktif = true;
    setLoading(true);
    setJumlah(1);

    api
      .get(`/produk/${id}`)
      .then(({ data }) => {
        if (!aktif) return;
        setProduk(data.data);
        setTerkait(data.terkait || []);
      })
      .catch(() => aktif && setProduk(null))
      .finally(() => aktif && setLoading(false));

    return () => {
      aktif = false;
    };
  }, [id]);

  if (loading) return <Spinner className="min-h-[60vh]" label="Memuat detail produk..." />;

  if (!produk) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageSearch}
          title="Produk tidak ditemukan"
          description="Produk yang Anda cari mungkin sudah tidak tersedia atau telah dihapus."
          action={
            <Link to="/produk" className="btn-primary">
              Kembali ke katalog
            </Link>
          }
        />
      </div>
    );
  }

  const habis = produk.stok <= 0;
  const stokRendah = produk.stok > 0 && produk.stok <= 10;
  const maksimal = Math.max(1, Math.min(produk.stok, 99));

  const tambah = (lanjut = false) => {
    if (habis) return;
    addItem(produk, jumlah);
    toast.success(`${produk.nama_produk} masuk keranjang`);
    if (lanjut) navigate('/checkout');
  };

  return (
    <div className="container-page py-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/" className="flex items-center gap-1 transition hover:text-brand-600">
          <Home className="h-3.5 w-3.5" /> Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/produk" className="transition hover:text-brand-600">
          Produk
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-600">{produk.nama_produk}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
          <div className="relative aspect-square bg-gradient-to-br from-brand-50 to-amber-50">
            <img
              src={productImage(produk.gambar)}
              alt={produk.nama_produk}
              className="h-full w-full object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
              {produk.kategori}
            </span>
            {produk.terjual > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                {formatNumber(produk.terjual)} terjual
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {produk.kategori}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            {produk.nama_produk}
          </h1>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">
              {formatRupiah(produk.harga)}
            </p>
            <span
              className={`badge mb-1 ${
                habis
                  ? 'bg-rose-50 text-rose-600'
                  : stokRendah
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {habis ? 'Stok habis' : `Stok tersedia ${produk.stok}`}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">{produk.deskripsi}</p>

          <div className="my-6 h-px bg-slate-100" />

          <div>
            <p className="text-sm font-semibold text-slate-700">Jumlah</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
                  disabled={jumlah <= 1 || habis}
                  className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:text-brand-600 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {jumlah}
                </span>
                <button
                  type="button"
                  onClick={() => setJumlah((prev) => Math.min(maksimal, prev + 1))}
                  disabled={jumlah >= maksimal || habis}
                  className="flex h-11 w-11 items-center justify-center text-slate-500 transition hover:text-brand-600 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Maks. {maksimal} pcs · subtotal{' '}
                <span className="font-semibold text-slate-600">
                  {formatRupiah(produk.harga * jumlah)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => tambah(false)}
              disabled={habis}
              className="btn-outline flex-1 py-3"
            >
              <ShoppingCart className="h-4 w-4" />
              Masukkan Keranjang
            </button>
            <button
              type="button"
              onClick={() => tambah(true)}
              disabled={habis}
              className="btn-primary flex-1 py-3"
            >
              <Zap className="h-4 w-4" />
              Beli Sekarang
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: BadgeCheck, text: 'Produk 100% original' },
              { icon: Truck, text: 'Gratis ongkir min. 300rb' },
              { icon: ShieldCheck, text: 'Transaksi aman & terpercaya' },
              { icon: ShoppingCart, text: 'Packing rapi & aman' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600"
              >
                <Icon className="h-4 w-4 shrink-0 text-brand-600" />
                {text}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
            <p className="text-xs font-semibold text-brand-800">Metode pembayaran tersedia</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-700/80">
              Transfer Bank · QRIS · E-Wallet · Bayar di Tempat (COD)
            </p>
          </div>
        </div>
      </div>

      {terkait.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
                Rekomendasi
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                Produk serupa
              </h2>
            </div>
            <Link
              to={`/produk?kategori=${encodeURIComponent(produk.kategori)}`}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Lihat semua
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {terkait.map((item) => (
              <ProductCard key={item.id_produk} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
