import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Package, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatRupiah } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';

const tabs = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function PesananSaya() {
  const [status, setStatus] = useState('');
  const [pesanan, setPesanan] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [batalTarget, setBatalTarget] = useState(null);
  const [memproses, setMemproses] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pesanan-saya', {
        params: { status: status || undefined, page },
      });
      setPesanan(data.data || []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    muat();
  }, [muat]);

  const batalkan = async () => {
    if (!batalTarget) return;
    setMemproses(true);
    try {
      await api.post(`/pesanan-saya/${batalTarget.id_pesanan}/batal`);
      toast.success('Pesanan berhasil dibatalkan');
      setBatalTarget(null);
      muat();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMemproses(false);
    }
  };

  return (
    <div className="container-page py-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white sm:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-300">
          <ClipboardList className="h-3.5 w-3.5" /> Riwayat Belanja
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Pesanan Saya
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-400">
          Pantau status pesanan dan lihat kembali seluruh transaksi yang pernah kamu lakukan.
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              status === tab.value
                ? 'bg-brand-600 text-white shadow-glow'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Memuat pesanan..." />
      ) : pesanan.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="Belum ada pesanan"
            description={
              status
                ? 'Tidak ada pesanan dengan status ini. Coba pilih tab lain.'
                : 'Kamu belum pernah melakukan pemesanan. Yuk mulai belanja sekarang.'
            }
            action={
              <Link to="/produk" className="btn-primary">
                Mulai Belanja
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {pesanan.map((order) => (
            <article key={order.id_pesanan} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Kode Pesanan
                    </p>
                    <p className="text-sm font-bold text-slate-800">{order.kode_pesanan}</p>
                  </div>
                  <div className="hidden h-8 w-px bg-slate-200 sm:block" />
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Tanggal
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      {formatDate(order.tanggal_pesanan)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Package className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold text-slate-800">
                      {order.details?.[0]?.nama_produk || 'Pesanan'}
                      {order.details?.length > 1 && (
                        <span className="font-medium text-slate-400">
                          {' '}
                          +{order.details.length - 1} produk lain
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {order.jumlah_item} item · {order.metode_pembayaran.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Total Bayar
                  </p>
                  <p className="text-base font-extrabold text-brand-700">
                    {formatRupiah(order.total_harga)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => setBatalTarget(order)}
                      className="btn-outline px-3 py-2 text-xs text-rose-600 hover:border-rose-200 hover:text-rose-700"
                    >
                      <XCircle className="h-4 w-4" /> Batalkan
                    </button>
                  )}
                  <Link
                    to={`/pesanan/${order.id_pesanan}`}
                    className="btn-dark px-4 py-2 text-xs"
                  >
                    Detail Pesanan
                  </Link>
                </div>
              </div>
            </article>
          ))}

          <Pagination meta={meta} onChange={setPage} className="pt-3" />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(batalTarget)}
        onClose={() => setBatalTarget(null)}
        onConfirm={batalkan}
        loading={memproses}
        title="Batalkan pesanan?"
        message={`Pesanan ${batalTarget?.kode_pesanan || ''} akan dibatalkan dan stok produk dikembalikan. Tindakan ini tidak dapat diurungkan.`}
        confirmLabel="Ya, batalkan"
      />
    </div>
  );
}
