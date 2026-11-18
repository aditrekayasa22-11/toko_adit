import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Loader2,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatRupiah, metodePembayaran } from '../../lib/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';

const filterStatus = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

const langkahBerikut = {
  pending: { status: 'diproses', label: 'Konfirmasi & Proses', icon: Package },
  diproses: { status: 'dikirim', label: 'Tandai Dikirim', icon: Truck },
  dikirim: { status: 'selesai', label: 'Tandai Selesai', icon: ShoppingBag },
};

export default function AdminPesanan() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [memuatDetail, setMemuatDetail] = useState(false);

  const [konfirmasi, setKonfirmasi] = useState(null);
  const [memproses, setMemproses] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pesanan', {
        params: { status: status || undefined, search, page },
      });
      setRows(data.data || []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    const timer = setTimeout(muat, 300);
    return () => clearTimeout(timer);
  }, [muat]);

  const bukaDetail = async (pesanan) => {
    setDetailOpen(true);
    setMemuatDetail(true);
    setSelected(pesanan);
    try {
      const { data } = await api.get(`/admin/pesanan/${pesanan.id_pesanan}`);
      setSelected(data.data);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMemuatDetail(false);
    }
  };

  const ubahStatus = async () => {
    if (!konfirmasi) return;
    setMemproses(true);
    try {
      const { data } = await api.put(
        `/admin/pesanan/${konfirmasi.order.id_pesanan}/status`,
        { status: konfirmasi.status }
      );
      toast.success(data.message);
      setKonfirmasi(null);
      if (detailOpen && selected?.id_pesanan === data.data.id_pesanan) {
        setSelected(data.data);
      }
      muat();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMemproses(false);
    }
  };

  const mintaKonfirmasi = (order, statusBaru) => {
    setKonfirmasi({ order, status: statusBaru });
  };

  const pesanKonfirmasi = () => {
    if (!konfirmasi) return '';
    if (konfirmasi.status === 'dibatalkan') {
      return `Pesanan ${konfirmasi.order.kode_pesanan} akan dibatalkan dan stok produk dikembalikan. Lanjutkan?`;
    }
    if (konfirmasi.status === 'selesai') {
      return `Pesanan ${konfirmasi.order.kode_pesanan} akan ditandai selesai. Transaksi penjualan akan otomatis tercatat di laporan. Lanjutkan?`;
    }
    return `Ubah status pesanan ${konfirmasi.order.kode_pesanan} menjadi ${konfirmasi.status}?`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Pesanan Online</h2>
        <p className="mt-1 text-sm text-slate-500">
          Kelola pesanan masuk, konfirmasi pembayaran, dan perbarui status pengiriman.
        </p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filterStatus.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  status === tab.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari kode atau nama pelanggan..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode Pesanan</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                    Memuat pesanan...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((pesanan) => (
                  <tr key={pesanan.id_pesanan} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{pesanan.kode_pesanan}</p>
                      <p className="text-[11px] text-slate-400">
                        {metodePembayaran[pesanan.metode_pembayaran]}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700">
                        {pesanan.pelanggan?.nama_pelanggan}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {pesanan.pelanggan?.telepon}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(pesanan.tanggal_pesanan, { month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{pesanan.jumlah_item} item</td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {formatRupiah(pesanan.total_harga)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pesanan.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => bukaDetail(pesanan)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Kelola <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-400">Belum ada pesanan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination meta={meta} onChange={setPage} />
        </div>
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detail Pesanan ${selected?.kode_pesanan || ''}`}
        description="Periksa detail pesanan sebelum mengubah status."
        size="lg"
        footer={
          selected && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Status saat ini: <StatusBadge status={selected.status} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {['pending', 'diproses'].includes(selected.status) && (
                  <button
                    type="button"
                    onClick={() => mintaKonfirmasi(selected, 'dibatalkan')}
                    className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Batalkan Pesanan
                  </button>
                )}
                {langkahBerikut[selected.status] && (
                  <button
                    type="button"
                    onClick={() =>
                      mintaKonfirmasi(selected, langkahBerikut[selected.status].status)
                    }
                    className="btn-primary px-4 py-2.5 text-xs"
                  >
                    {langkahBerikut[selected.status].label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {['selesai', 'dibatalkan'].includes(selected.status) && (
                  <span className="text-xs text-slate-400">Pesanan sudah final.</span>
                )}
              </div>
            </div>
          )
        }
      >
        {memuatDetail && !selected?.details ? (
          <div className="py-10 text-center text-slate-400">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
            Memuat detail pesanan...
          </div>
        ) : (
          selected && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Pelanggan
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selected.pelanggan?.nama_pelanggan}
                  </p>
                  <p className="text-xs text-slate-500">{selected.pelanggan?.telepon}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Tanggal Pesanan
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(selected.tanggal_pesanan)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Metode Pembayaran
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" />
                    {metodePembayaran[selected.metode_pembayaran]}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> Alamat Pengiriman
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {selected.alamat_pengiriman}
                </p>
                {selected.catatan && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-700">
                    Catatan: {selected.catatan}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700">Produk Dipesan</p>
                <div className="mt-2 divide-y divide-slate-100">
                  {selected.details?.map((detail) => (
                    <div key={detail.id_detail} className="flex items-center gap-3 py-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                          {detail.nama_produk}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {detail.jumlah} × {formatRupiah(detail.harga)}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {formatRupiah(detail.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos kirim</span>
                  <span>
                    {selected.ongkir === 0 ? 'Gratis' : formatRupiah(selected.ongkir)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-sm font-bold text-slate-800">
                  <span>Total</span>
                  <span className="text-brand-700">{formatRupiah(selected.total_harga)}</span>
                </div>
              </div>
            </div>
          )
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(konfirmasi)}
        onClose={() => setKonfirmasi(null)}
        onConfirm={ubahStatus}
        loading={memproses}
        title="Konfirmasi Perubahan Status"
        message={pesanKonfirmasi()}
        confirmLabel="Ya, lanjutkan"
        danger={konfirmasi?.status === 'dibatalkan'}
      />
    </div>
  );
}
