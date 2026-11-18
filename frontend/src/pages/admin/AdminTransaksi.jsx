import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatNumber, formatRupiah } from '../../lib/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

const tanggalLokal = () => {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset();
  return new Date(sekarang.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function AdminTransaksi() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [ringkasan, setRingkasan] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [loading, setLoading] = useState(true);

  const [options, setOptions] = useState({ pelanggan: [], produk: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [produkDipilih, setProdukDipilih] = useState('');
  const [saving, setSaving] = useState(false);
  const [hapusTarget, setHapusTarget] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  const formKosong = {
    id_pelanggan: '',
    tanggal_transaksi: tanggalLokal(),
    nama_produk: '',
    jumlah: '1',
    total_harga: '',
  };
  const [form, setForm] = useState(formKosong);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/transaksi', {
        params: {
          search,
          dari: dari || undefined,
          sampai: sampai || undefined,
          page,
        },
      });
      setRows(data.data || []);
      setMeta(data.meta);
      setRingkasan(data.ringkasan);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [search, dari, sampai, page]);

  useEffect(() => {
    const timer = setTimeout(muat, 300);
    return () => clearTimeout(timer);
  }, [muat]);

  useEffect(() => {
    api
      .get('/admin/transaksi-options')
      .then(({ data }) => setOptions(data))
      .catch(() => {});
  }, []);

  const bukaTambah = () => {
    setEditing(null);
    setProdukDipilih('');
    setForm(formKosong);
    setModalOpen(true);
  };

  const bukaEdit = (transaksi) => {
    setEditing(transaksi);
    const produk = options.produk.find((item) => item.nama_produk === transaksi.nama_produk);
    setProdukDipilih(produk ? String(produk.id_produk) : '');
    setForm({
      id_pelanggan: String(transaksi.id_pelanggan),
      tanggal_transaksi: transaksi.tanggal_transaksi,
      nama_produk: transaksi.nama_produk,
      jumlah: String(transaksi.jumlah),
      total_harga: String(transaksi.total_harga),
    });
    setModalOpen(true);
  };

  const ubah = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const pilihProduk = (event) => {
    const id = event.target.value;
    setProdukDipilih(id);
    const produk = options.produk.find((item) => String(item.id_produk) === id);

    if (produk) {
      setForm((prev) => ({
        ...prev,
        nama_produk: produk.nama_produk,
        total_harga: String(produk.harga * Number(prev.jumlah || 1)),
      }));
    }
  };

  const ubahJumlah = (event) => {
    const jumlah = event.target.value;
    const produk = options.produk.find((item) => String(item.id_produk) === produkDipilih);

    setForm((prev) => ({
      ...prev,
      jumlah,
      total_harga: produk ? String(produk.harga * Number(jumlah || 0)) : prev.total_harga,
    }));
  };

  const simpan = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id_pelanggan: Number(form.id_pelanggan),
        tanggal_transaksi: form.tanggal_transaksi,
        nama_produk: form.nama_produk,
        jumlah: Number(form.jumlah),
        total_harga: Number(form.total_harga),
      };

      if (editing) {
        await api.put(`/admin/transaksi/${editing.id_transaksi}`, payload);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await api.post('/admin/transaksi', payload);
        toast.success('Transaksi berhasil ditambahkan');
      }

      setModalOpen(false);
      muat();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  };

  const hapus = async () => {
    if (!hapusTarget) return;
    setMenghapus(true);
    try {
      await api.delete(`/admin/transaksi/${hapusTarget.id_transaksi}`);
      toast.success('Transaksi berhasil dihapus');
      setHapusTarget(null);
      muat();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMenghapus(false);
    }
  };

  const resetFilter = () => {
    setSearch('');
    setDari('');
    setSampai('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Manajemen Transaksi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Catat penjualan toko dan pantau seluruh transaksi pelanggan.
          </p>
        </div>
        <button type="button" onClick={bukaTambah} className="btn-primary">
          <Plus className="h-4 w-4" /> Catat Transaksi
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Pendapatan</p>
            <p className="text-base font-extrabold text-slate-900">
              {formatRupiah(ringkasan?.total_pendapatan ?? 0)}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Jumlah Transaksi</p>
            <p className="text-base font-extrabold text-slate-900">
              {formatNumber(ringkasan?.jumlah_transaksi ?? 0)}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Item Terjual</p>
            <p className="text-base font-extrabold text-slate-900">
              {formatNumber(ringkasan?.total_item ?? 0)} pcs
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama pelanggan atau produk..."
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={dari}
                onChange={(event) => {
                  setDari(event.target.value);
                  setPage(1);
                }}
                className="border-0 bg-transparent py-2.5 text-xs text-slate-600 outline-none"
              />
              <span className="text-xs text-slate-300">s/d</span>
              <input
                type="date"
                value={sampai}
                onChange={(event) => {
                  setSampai(event.target.value);
                  setPage(1);
                }}
                className="border-0 bg-transparent py-2.5 text-xs text-slate-600 outline-none"
              />
            </div>
            {(search || dari || sampai) && (
              <button type="button" onClick={resetFilter} className="btn-ghost text-xs">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">ID / Tanggal</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Jumlah</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                    Memuat transaksi...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((transaksi) => (
                  <tr key={transaksi.id_transaksi} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-700">TRX-{transaksi.id_transaksi}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(transaksi.tanggal_transaksi, { month: 'short' })}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {transaksi.nama_pelanggan}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{transaksi.nama_produk}</td>
                    <td className="px-4 py-3 text-slate-500">{transaksi.jumlah} pcs</td>
                    <td className="px-4 py-3 font-bold text-brand-700">
                      {formatRupiah(transaksi.total_harga)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => bukaEdit(transaksi)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit transaksi"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHapusTarget(transaksi)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-400">Transaksi tidak ditemukan.</p>
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
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
        description="Transaksi yang dicatat akan masuk ke laporan penjualan."
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Batal
            </button>
            <button type="submit" form="form-transaksi" className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        }
      >
        <form id="form-transaksi" onSubmit={simpan} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Pelanggan</label>
              <select
                name="id_pelanggan"
                value={form.id_pelanggan}
                onChange={ubah}
                className="input"
                required
              >
                <option value="">Pilih pelanggan</option>
                {options.pelanggan.map((pelanggan) => (
                  <option key={pelanggan.id_pelanggan} value={pelanggan.id_pelanggan}>
                    {pelanggan.nama_pelanggan}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tanggal transaksi</label>
              <input
                type="date"
                name="tanggal_transaksi"
                value={form.tanggal_transaksi}
                onChange={ubah}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">
              Pilih produk <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <select
              value={produkDipilih}
              onChange={pilihProduk}
              className="input"
            >
              <option value="">-- Isi nama produk manual --</option>
              {options.produk.map((produk) => (
                <option key={produk.id_produk} value={produk.id_produk}>
                  {produk.nama_produk} — {formatRupiah(produk.harga)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Nama produk</label>
            <input
              name="nama_produk"
              value={form.nama_produk}
              onChange={ubah}
              className="input"
              placeholder="Nama produk yang dibeli"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Jumlah</label>
              <input
                type="number"
                name="jumlah"
                value={form.jumlah}
                onChange={ubahJumlah}
                className="input"
                min={1}
                required
              />
            </div>
            <div>
              <label className="label">Total harga (Rp)</label>
              <input
                type="number"
                name="total_harga"
                value={form.total_harga}
                onChange={ubah}
                className="input"
                min={0}
                placeholder="250000"
                required
              />
            </div>
          </div>

          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
            Total harga otomatis dihitung dari harga produk dikali jumlah saat Anda memilih
            produk. Nilai total tetap bisa diedit manual.
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(hapusTarget)}
        onClose={() => setHapusTarget(null)}
        onConfirm={hapus}
        loading={menghapus}
        title="Hapus transaksi?"
        message={`Transaksi TRX-${hapusTarget?.id_transaksi || ''} milik ${hapusTarget?.nama_pelanggan || ''} akan dihapus dari laporan. Tindakan ini tidak dapat diurungkan.`}
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}
