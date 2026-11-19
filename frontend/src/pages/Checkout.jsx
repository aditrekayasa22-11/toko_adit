import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  QrCode,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatRupiah, metodePembayaran, productImage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';

const metodeList = [
  {
    value: 'transfer_bank',
    icon: Landmark,
    title: 'Transfer Bank',
    desc: 'BCA, BRI, Mandiri',
  },
  { value: 'qris', icon: QrCode, title: 'QRIS', desc: 'Scan dengan e-wallet apa saja' },
  { value: 'ewallet', icon: Wallet, title: 'E-Wallet', desc: 'GoPay, OVO, Dana' },
  { value: 'cod', icon: Banknote, title: 'COD', desc: 'Bayar saat barang tiba' },
];

const langkah = ['Keranjang', 'Pengiriman & Pembayaran', 'Selesai'];

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, ongkir, total, clearCart } = useCart();
  const navigate = useNavigate();

  const pelanggan = user?.pelanggan;
  const [alamat, setAlamat] = useState(pelanggan?.alamat || '');
  const [catatan, setCatatan] = useState('');
  const [metode, setMetode] = useState('transfer_bank');
  const [loading, setLoading] = useState(false);

  if (user && !pelanggan) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={User}
          title="Akun admin tidak dapat membuat pesanan"
          description="Silakan masuk menggunakan akun pelanggan untuk melakukan pembelian."
          action={
            <Link to="/admin" className="btn-primary">
              Buka Dashboard Admin
            </Link>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Keranjang masih kosong"
          description="Tambahkan produk ke keranjang terlebih dahulu sebelum melakukan checkout."
          action={
            <Link to="/produk" className="btn-primary">
              Pilih Produk
            </Link>
          }
        />
      </div>
    );
  }

  const kirim = async (event) => {
    event.preventDefault();

    if (!alamat.trim()) {
      toast.error('Alamat pengiriman wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/pesanan', {
        items: items.map((item) => ({ id_produk: item.id_produk, jumlah: item.jumlah })),
        alamat_pengiriman: alamat.trim(),
        metode_pembayaran: metode,
        catatan: catatan.trim() || null,
      });

      const orderId = data.data.id_pesanan;
      clearCart();
      if (metode !== 'cod') {
        try {
          const payment = await api.post(`/pesanan-saya/${orderId}/pembayaran`);
          window.location.assign(payment.data.data.payment_url);
          return;
        } catch (paymentError) {
          toast.error(`${apiError(paymentError)} Pesanan tersimpan; pembayaran bisa dicoba dari detail pesanan.`);
        }
      } else {
        toast.success('Pesanan COD berhasil dibuat!');
      }
      navigate(`/pesanan/${orderId}?baru=1`);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-8">
      <Link
        to="/keranjang"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke keranjang
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Checkout Pesanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lengkapi data pengiriman dan pilih metode pembayaran.
          </p>
        </div>
        <ol className="flex items-center gap-2 text-xs font-semibold">
          {langkah.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  index <= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {index + 1}
              </span>
              <span className={index <= 1 ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
              {index < langkah.length - 1 && <span className="h-px w-4 bg-slate-300" />}
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={kirim} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Alamat Pengiriman</h2>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nama penerima</label>
                <input className="input bg-slate-50" value={user?.name || ''} readOnly />
              </div>
              <div>
                <label className="label">Nomor telepon</label>
                <input
                  className="input bg-slate-50"
                  value={pelanggan?.telepon || '-'}
                  readOnly
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Alamat lengkap</label>
                <textarea
                  className="input min-h-[96px] resize-y"
                  value={alamat}
                  onChange={(event) => setAlamat(event.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Pastikan alamat lengkap agar kurir mudah menemukan lokasi.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="label">
                  Catatan untuk penjual <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  className="input"
                  value={catatan}
                  onChange={(event) => setCatatan(event.target.value)}
                  placeholder="Contoh: titip di pos keamanan"
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-bold text-slate-900">Metode Pembayaran</h2>
            <p className="mt-1 text-xs text-slate-400">
              Pembayaran dikonfirmasi oleh admin sebelum pesanan diproses.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metodeList.map(({ value, icon: Icon, title, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMetode(value)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    metode === value
                      ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100'
                      : 'border-slate-200 bg-white hover:border-brand-200'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      metode === value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">{title}</span>
                    <span className="block text-xs text-slate-400">{desc}</span>
                  </span>
                  {metode === value && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card p-5">
            <h2 className="text-base font-bold text-slate-900">Ringkasan Pesanan</h2>

            <div className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id_produk} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                    <img
                      src={productImage(item.gambar)}
                      alt={item.nama_produk}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-700">
                      {item.nama_produk}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.jumlah} × {formatRupiah(item.harga)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-800">
                    {formatRupiah(item.harga * item.jumlah)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Ongkos kirim</span>
                <span className="font-semibold text-emerald-600">
                  {ongkir === 0 ? 'Gratis' : formatRupiah(ongkir)}
                </span>
              </div>
              <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-700">Total bayar</span>
                <span className="text-xl font-extrabold text-brand-700">
                  {formatRupiah(total)}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Metode: <span className="font-semibold text-slate-700">{metodePembayaran[metode]}</span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-4 w-full py-3">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                </>
              ) : (
                <>Buat Pesanan</>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="h-3 w-3" /> Data transaksi Anda aman
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
