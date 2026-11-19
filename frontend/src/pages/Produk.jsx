import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Backpack,
  Footprints,
  Layers,
  LayoutDashboard,
  Package,
  PackageSearch,
  Search,
  Shirt,
  Sparkles,
  Watch,
} from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';

const kategoriIkon = {
  Atasan: Shirt,
  Bawahan: Layers,
  Sepatu: Footprints,
  Tas: Backpack,
  Aksesoris: Watch,
  Perawatan: Sparkles,
};

function SkeletonCard() {
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

export default function Produk() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriAktif = searchParams.get('kategori') || 'Semua';

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'terbaru');
  const [page, setPage] = useState(1);
  const [produk, setProduk] = useState([]);
  const [meta, setMeta] = useState(null);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSort(searchParams.get('sort') || 'terbaru');
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    api
      .get('/kategori')
      .then(({ data }) => setKategori(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let aktif = true;
    setLoading(true);

    const timer = setTimeout(
      () => {
        api
          .get('/produk', {
            params: { search, kategori: kategoriAktif, sort, page, per_page: 12 },
          })
          .then(({ data }) => {
            if (!aktif) return;
            setProduk(data.data || []);
            setMeta(data.meta);
          })
          .catch(() => {
            if (aktif) {
              setProduk([]);
              setMeta(null);
            }
          })
          .finally(() => aktif && setLoading(false));
      },
      search ? 350 : 0
    );

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [search, kategoriAktif, sort, page]);

  const gantiKategori = (nama) => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (nama === 'Semua') params.delete('kategori');
    else params.set('kategori', nama);
    setSearchParams(params, { replace: true });
  };

  const resetFilter = () => {
    setSearch('');
    setSort('terbaru');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="customer-catalog mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="customer-catalog-heading flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-brand-700"><Sparkles className="h-3.5 w-3.5" /> Koleksi Fashion Store</span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {sort === 'populer' ? 'Produk Terlaris' : 'Produk'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {sort === 'populer'
              ? 'Lihat produk yang paling banyak dibeli pelanggan Fashion Store.'
              : 'Telusuri seluruh koleksi fashion, sepatu, tas, dan aksesoris Fashion Store.'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 sm:self-auto"
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_34px_rgba(44,20,34,.08)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari produk favoritmu..."
                className="input pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="hidden text-xs font-medium text-slate-500 sm:block">
                Urutkan
              </label>
              <select
                value={sort}
                onChange={(event) => {
                  const nextSort = event.target.value;
                  setSort(nextSort);
                  setPage(1);
                  const params = new URLSearchParams(searchParams);
                  if (nextSort === 'terbaru') params.delete('sort');
                  else params.set('sort', nextSort);
                  setSearchParams(params, { replace: true });
                }}
                className="input w-auto min-w-[170px] cursor-pointer py-2 text-xs"
              >
                <option value="terbaru">Terbaru</option>
                <option value="populer">Paling Populer</option>
                <option value="termurah">Harga Terendah</option>
                <option value="termahal">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => gantiKategori('Semua')}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                kategoriAktif === 'Semua'
                  ? 'bg-[#4b1830] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              <Package className="h-4 w-4" /> Semua
              <span
                className={`text-[11px] font-normal ${
                  kategoriAktif === 'Semua' ? 'text-brand-200' : 'text-slate-400'
                }`}
              >
                {kategori.reduce((total, item) => total + item.jumlah, 0)}
              </span>
            </button>
            {kategori.map((item) => {
              const Icon = kategoriIkon[item.kategori] || Sparkles;
              return (
                <button
                  key={item.kategori}
                  type="button"
                  onClick={() => gantiKategori(item.kategori)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    kategoriAktif === item.kategori
                      ? 'bg-[#4b1830] text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.kategori}
                  <span
                    className={`text-[11px] font-normal ${
                      kategoriAktif === item.kategori ? 'text-brand-200' : 'text-slate-400'
                    }`}
                  >
                    {item.jumlah}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pt-4 sm:px-5">
          <p className="text-xs font-medium text-slate-400">
            {loading
              ? 'Memuat produk...'
              : `Menampilkan ${produk.length} dari ${meta?.total ?? 0} produk`}
            {!loading && <span className="text-slate-400"> Â· {kategori.length} kategori</span>}
            {kategoriAktif !== 'Semua' && (
              <span className="text-slate-500"> · kategori {kategoriAktif}</span>
            )}
          </p>
          {(search || kategoriAktif !== 'Semua' || sort !== 'terbaru') && (
            <button
              type="button"
              onClick={resetFilter}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              Reset filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="customer-product-grid grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-5 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : produk.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={PackageSearch}
              title="Produk tidak ditemukan"
              description="Coba ubah kata kunci pencarian atau pilih kategori lain yang tersedia."
              action={
                <button type="button" onClick={resetFilter} className="btn-primary">
                  Lihat semua produk
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-4">
            {produk.map((item) => (
              <ProductCard key={item.id_produk} product={item} />
            ))}
          </div>
        )}

        <Pagination meta={meta} onChange={setPage} className="border-t border-slate-100 px-5 py-4" />
      </div>
    </div>
  );
}
