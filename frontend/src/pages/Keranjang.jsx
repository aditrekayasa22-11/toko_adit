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
    <div className="relative isolate min-h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(214,177,119,0.18),transparent_34%),radial-gradient(ellipse_at_bottom_right,rgba(116,30,60,0.14),transparent_42%),linear-gradient(135deg,#fffaf5_0%,#f7eff1_52%,#f1e8e6_100%)] py-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-72 h-80 w-80 rounded-full bg-rose-300/20 blur-3xl" />
      <div className="container-page relative">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d7bd86]/60 bg-white/65 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#8a5c26] shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b68a42] shadow-[0_0_0_3px_rgba(182,138,66,.15)]" />
            Keranjang Belanja · Pilihan Istimewa
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-.04em] text-[#35111f] sm:text-4xl">
            Produk pilihanmu
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#766572]">
            Periksa kembali produk sebelum melanjutkan ke pembayaran.
          </p>
        </div>
        <Link to="/produk" className="inline-flex items-center gap-2 self-start rounded-full border border-[#d8c7bb] bg-white/65 px-4 py-2 text-xs font-bold text-[#5b2338] shadow-sm backdrop-blur transition hover:border-[#b68a42] hover:bg-white sm:self-auto">
          Lanjut belanja →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Keranjang masih kosong"
            description="Yuk, temukan produk favoritmu dan mulai belanja di Fashion Store."
            action={
              <Link to="/produk" className="btn-primary">
                Mulai Belanja <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-[#b88d4e]/35 bg-[linear-gradient(115deg,#32101f_0%,#5b1b36_58%,#3b1528_100%)] p-4 text-[#fff8ec] shadow-[0_16px_34px_rgba(62,20,39,.16)]">
              <div aria-hidden="true" className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-[#f2d89b]/15" />
              <div aria-hidden="true" className="absolute -right-1 -top-5 h-24 w-24 rounded-full border border-[#f2d89b]/10" />
              <div className="relative flex items-center gap-2 text-sm font-semibold">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e1c37d]/15 text-[#f0d89b]"><Truck className="h-4 w-4" /></span>
                {sisaGratisOngkir > 0
                  ? `Tambah ${formatRupiah(sisaGratisOngkir)} lagi untuk gratis ongkir`
                  : 'Selamat! Pesananmu sudah gratis ongkir'}
              </div>
              <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/15 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c79a52] via-[#f0d99d] to-[#fff0bf] shadow-[0_0_14px_rgba(240,217,157,.5)] transition-all duration-500"
                  style={{ width: `${progres}%` }}
                />
              </div>
              <p className="relative mt-2 text-[10px] font-medium tracking-wide text-[#e8d8bd]">Gratis ongkir untuk belanja minimal {formatRupiah(gratisOngkirMin)}</p>
            </div>

            {items.map((item) => (
              <div key={item.id_produk} className="group flex gap-3 rounded-2xl border border-[#e6d8c8] bg-[linear-gradient(110deg,rgba(255,255,255,.96),rgba(255,251,243,.94)_58%,rgba(250,240,243,.94))] p-3 shadow-[0_12px_32px_rgba(66,35,42,.08)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#c4a365]/70 hover:shadow-[0_18px_38px_rgba(66,35,42,.13)] sm:gap-4 sm:p-4">
                <Link
                  to={`/produk/${item.id_produk}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#dbc895]/70 bg-[#f5ece8] p-0.5 shadow-[0_5px_14px_rgba(65,32,42,.12)] sm:h-28 sm:w-28"
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
                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a17d68]">
                        {item.kategori}
                      </p>
                      <Link
                        to={`/produk/${item.id_produk}`}
                        className="mt-1 line-clamp-1 text-sm font-extrabold text-[#35111f] transition hover:text-[#9a3b5c] sm:text-base"
                      >
                        {item.nama_produk}
                      </Link>
                      <p className="mt-1 text-[11px] font-medium text-[#9b8991]">Stok tersedia {item.stok}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id_produk)}
                      className="rounded-lg p-1.5 text-[#a78b91] transition hover:bg-[#f8e6eb] hover:text-[#9b3453]"
                      aria-label="Hapus produk"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-xl border border-[#e5d8cc] bg-white/80 shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id_produk, item.jumlah - 1)}
                        disabled={item.jumlah <= 1}
                        className="flex h-9 w-9 items-center justify-center text-[#806c75] transition hover:text-[#9b3453] disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-extrabold text-[#35111f]">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateJumlah(item.id_produk, item.jumlah + 1)}
                        disabled={item.jumlah >= item.stok}
                        className="flex h-9 w-9 items-center justify-center text-[#806c75] transition hover:text-[#9b3453] disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-medium text-[#a28e94]">
                        {formatRupiah(item.harga)} × {item.jumlah}
                      </p>
                      <p className="text-sm font-black text-[#70223f] sm:text-base">
                        {formatRupiah(item.harga * item.jumlah)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#c8a65f]/45 bg-[radial-gradient(ellipse_at_top_right,rgba(213,179,105,.2),transparent_42%),linear-gradient(150deg,#32101f_0%,#4a1730_56%,#2c0e1e_100%)] p-5 text-[#fff7ea] shadow-[0_24px_50px_rgba(51,16,31,.28)]">
              <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#efd28b] to-transparent" />
              <div className="relative flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[#e5ca87]/25 bg-[#e5ca87]/10 text-[#efd28b]"><ShoppingBag className="h-4 w-4" /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d9bb7b]">Pesananmu</p><h2 className="mt-0.5 text-base font-extrabold">Ringkasan Belanja</h2></div>
              </div>

              <div className="relative mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-[#e2cfd5]">
                  <span>Subtotal ({items.length} produk)</span>
                  <span className="font-bold text-white">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#e2cfd5]">
                  <span>Ongkos kirim</span>
                  <span className="font-bold text-[#8de0b7]">
                    {ongkir === 0 ? 'Gratis' : formatRupiah(ongkir)}
                  </span>
                </div>
                <div className="border-t border-dashed border-white/20 pt-4">
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-[#f0e1e4]">Total bayar</span>
                    <span className="text-2xl font-black tracking-tight text-[#f2d995]">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d5b66d] via-[#f0d99c] to-[#c99d54] px-4 py-3 text-sm font-extrabold text-[#32101f] shadow-[0_10px_24px_rgba(211,177,105,.22)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0">
                Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8de0b7]" />
                <p className="text-[10px] leading-relaxed text-[#e0ced4]">
                  Transaksi dilindungi. Pembayaran hanya melalui metode resmi yang tersedia
                  saat checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
