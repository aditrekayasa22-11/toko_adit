import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah, productImage } from '../lib/api';
import EmptyState from '../components/EmptyState';

export default function Keranjang() {
  const {
    items,
    updateJumlah,
    removeItem,
    subtotal,
    ongkir,
    total,
    sisaGratisOngkir,
    gratisOngkirMin,
  } = useCart();

  const progres = Math.min(100, Math.round((subtotal / gratisOngkirMin) * 100));

  return (
    <div className="container-page py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
            Keranjang Belanja
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Produk pilihanmu
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Periksa kembali produk sebelum melanjutkan ke pembayaran.
          </p>
        </div>
        <Link to="/produk" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          Lanjut belanja →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Keranjang masih kosong"
            description="Yuk, temukan produk favoritmu dan mulai belanja di Toko Adit."
            action={
              <Link to="/produk" className="btn-primary">
                Mulai Belanja <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                <Truck className="h-4 w-4" />
                {sisaGratisOngkir > 0
                  ? `Tambah ${formatRupiah(sisaGratisOngkir)} lagi untuk gratis ongkir`
                  : 'Selamat! Pesananmu sudah gratis ongkir'}
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${progres}%` }}
                />
              </div>
            </div>

            {items.map((item) => (
              <div key={item.id_produk} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
                <Link
                  to={`/produk/${item.id_produk}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-50/60 sm:h-28 sm:w-28"
                >
                  <img
                    src={productImage(item.gambar)}
                    alt={item.nama_produk}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {item.kategori}
                      </p>
                      <Link
                        to={`/produk/${item.id_produk}`}
                        className="mt-0.5 line-clamp-1 text-sm font-bold text-slate-800 hover:text-brand-700 sm:text-base"
                      >
                        {item.nama_produk}
                      </Link>
                      <p className="mt-1 text-xs text-slate-400">Stok tersedia {item.stok}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id_produk)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Hapus produk"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id_produk, item.jumlah - 1)}
                        disabled={item.jumlah <= 1}
                        className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-brand-600 disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id_produk, item.jumlah + 1)}
                        disabled={item.jumlah >= item.stok}
                        className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-brand-600 disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        {formatRupiah(item.harga)} × {item.jumlah}
                      </p>
                      <p className="text-sm font-extrabold text-brand-700 sm:text-base">
                        {formatRupiah(item.harga * item.jumlah)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="card p-5">
              <h2 className="text-base font-bold text-slate-900">Ringkasan Belanja</h2>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({items.length} produk)</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos kirim</span>
                  <span className="font-semibold text-emerald-600">
                    {ongkir === 0 ? 'Gratis' : formatRupiah(ongkir)}
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-3">
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-700">Total bayar</span>
                    <span className="text-xl font-extrabold text-brand-700">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary mt-5 w-full py-3">
                Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Transaksi dilindungi. Pembayaran hanya melalui metode resmi yang tersedia
                  saat checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
