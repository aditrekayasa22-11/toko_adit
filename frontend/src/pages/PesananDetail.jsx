import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
  PackageSearch,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatRupiah, metodePembayaran } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const langkahStatus = [
  { key: 'pending', label: 'Menunggu Konfirmasi', icon: ClipboardList },
  { key: 'diproses', label: 'Sedang Diproses', icon: Package },
  { key: 'dikirim', label: 'Dalam Pengiriman', icon: Truck },
  { key: 'selesai', label: 'Pesanan Selesai', icon: CheckCircle2 },
];

const instruksiPembayaran = {
  transfer_bank:
    'Silakan transfer ke rekening BCA 1234567890 a.n. Toko Adit. Setelah melakukan pembayaran, hubungi admin melalui WhatsApp 0812-3456-7891 untuk konfirmasi.',
  qris: 'Buka aplikasi pembayaran favoritmu, pilih QRIS, lalu scan kode QR yang dikirim oleh admin. Simpan bukti pembayaran.',
  ewallet:
    'Kirim pembayaran ke GoPay / OVO / Dana 0812-3456-7891 a.n. Toko Adit, kemudian konfirmasi kepada admin.',
  cod: 'Siapkan uang tunai sesuai total pesanan. Pembayaran dilakukan saat kurir menyerahkan barang.',
};

export default function PesananDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sukses = searchParams.get('baru') === '1';

  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batalOpen, setBatalOpen] = useState(false);
  const [memproses, setMemproses] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/pesanan-saya/${id}`);
      setPesanan(data.data);
    } catch {
      setPesanan(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  const batalkan = async () => {
    setMemproses(true);
    try {
      const { data } = await api.post(`/pesanan-saya/${id}/batal`);
      setPesanan(data.data);
      setBatalOpen(false);
      toast.success('Pesanan berhasil dibatalkan');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMemproses(false);
    }
  };

  if (loading) return <Spinner className="min-h-[60vh]" label="Memuat detail pesanan..." />;

  if (!pesanan) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageSearch}
          title="Pesanan tidak ditemukan"
          description="Pesanan yang Anda cari tidak tersedia atau bukan milik akun Anda."
          action={
            <Link to="/pesanan" className="btn-primary">
              Kembali ke Pesanan Saya
            </Link>
          }
        />
      </div>
    );
  }

  const statusIndex = langkahStatus.findIndex((item) => item.key === pesanan.status);
  const dibatalkan = pesanan.status === 'dibatalkan';

  return (
    <div className="container-page py-8">
      <Link
        to="/pesanan"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke pesanan saya
      </Link>

      {sukses && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Pesanan berhasil dibuat!</p>
            <p className="mt-0.5 text-xs text-emerald-700">
              Terima kasih sudah berbelanja. Simpan kode pesanan dan selesaikan pembayaran.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {pesanan.kode_pesanan}
            </h1>
            <StatusBadge status={pesanan.status} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Dibuat {formatDate(pesanan.tanggal_pesanan)} · {pesanan.jumlah_item} item
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-400">Total pembayaran</p>
          <p className="text-2xl font-extrabold text-brand-700">
            {formatRupiah(pesanan.total_harga)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Status Pesanan</h2>

            {dibatalkan ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-rose-50 p-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <p className="text-sm font-bold text-rose-800">Pesanan dibatalkan</p>
                  <p className="mt-0.5 text-xs text-rose-700">
                    Pesanan ini telah dibatalkan. Stok produk sudah dikembalikan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-0">
                {langkahStatus.map((item, index) => {
                  const Icon = item.icon;
                  const aktif = index <= statusIndex;
                  const sekarang = index === statusIndex;
                  return (
                    <div key={item.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                            aktif
                              ? 'border-brand-500 bg-brand-500 text-white'
                              : 'border-slate-200 bg-white text-slate-300'
                          }`}
                        >
                          {aktif ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </span>
                        {index < langkahStatus.length - 1 && (
                          <span
                            className={`my-1 h-8 w-0.5 ${
                              index < statusIndex ? 'bg-brand-500' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-2">
                        <p
                          className={`text-sm font-semibold ${
                            sekarang ? 'text-brand-700' : aktif ? 'text-slate-700' : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {aktif
                            ? index === statusIndex
                              ? 'Status saat ini'
                              : 'Sudah dilewati'
                            : 'Menunggu proses'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pesanan.status === 'pending' && (
              <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4">
                <p className="text-xs font-bold text-amber-800">
                  Instruksi pembayaran · {metodePembayaran[pesanan.metode_pembayaran]}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-700">
                  {instruksiPembayaran[pesanan.metode_pembayaran]}
                </p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">
              Produk Dipesan ({pesanan.details?.length})
            </h2>
            <div className="mt-4 divide-y divide-slate-100">
              {pesanan.details?.map((detail) => (
                <div key={detail.id_detail} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Package className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-800">
                      {detail.nama_produk}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {detail.jumlah} × {formatRupiah(detail.harga)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-800">
                    {formatRupiah(detail.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Informasi Pengiriman</h2>
            <div className="mt-3 flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <div className="text-sm">
                <p className="font-semibold text-slate-800">
                  {pesanan.pelanggan?.nama_pelanggan}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{pesanan.pelanggan?.telepon}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {pesanan.alamat_pengiriman}
                </p>
              </div>
            </div>
            {pesanan.catatan && (
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Catatan
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{pesanan.catatan}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-bold text-slate-900">Rincian Pembayaran</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-700">
                  {formatRupiah(pesanan.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Ongkos kirim</span>
                <span className="font-semibold text-emerald-600">
                  {pesanan.ongkir === 0 ? 'Gratis' : formatRupiah(pesanan.ongkir)}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="font-extrabold text-brand-700">
                  {formatRupiah(pesanan.total_harga)}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <Wallet className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400">Metode pembayaran</p>
                <p className="text-xs font-semibold text-slate-700">
                  {metodePembayaran[pesanan.metode_pembayaran]}
                </p>
              </div>
            </div>

            {pesanan.status === 'pending' && (
              <button
                type="button"
                onClick={() => setBatalOpen(true)}
                className="mt-4 w-full rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Batalkan Pesanan
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={batalOpen}
        onClose={() => setBatalOpen(false)}
        onConfirm={batalkan}
        loading={memproses}
        title="Batalkan pesanan?"
        message="Pesanan akan dibatalkan dan stok produk dikembalikan. Tindakan ini tidak dapat diurungkan."
        confirmLabel="Ya, batalkan"
      />
    </div>
  );
}
