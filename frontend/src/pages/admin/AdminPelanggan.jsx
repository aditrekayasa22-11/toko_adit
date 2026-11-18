import { useCallback, useEffect, useState } from 'react';
import { Loader2, MapPin, Pencil, Phone, Plus, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatNumber, formatRupiah } from '../../lib/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

const kosong = { nama_pelanggan: '', alamat: '', telepon: '' };

export default function AdminPelanggan() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(kosong);
  const [saving, setSaving] = useState(false);

  const [hapusTarget, setHapusTarget] = useState(null);
  const [menghapus, setMenghapus] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pelanggan', { params: { search, page } });
      setRows(data.data || []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(muat, 300);
    return () => clearTimeout(timer);
  }, [muat]);

  const bukaTambah = () => {
    setEditing(null);
    setForm({ ...kosong });
    setModalOpen(true);
  };

  const bukaEdit = (pelanggan) => {
    setEditing(pelanggan);
    setForm({
      nama_pelanggan: pelanggan.nama_pelanggan,
      alamat: pelanggan.alamat,
      telepon: pelanggan.telepon,
    });
    setModalOpen(true);
  };

  const ubah = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const simpan = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/pelanggan/${editing.id_pelanggan}`, form);
        toast.success('Data pelanggan berhasil diperbarui');
      } else {
        await api.post('/admin/pelanggan', form);
        toast.success('Pelanggan berhasil ditambahkan');
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
      await api.delete(`/admin/pelanggan/${hapusTarget.id_pelanggan}`);
      toast.success('Pelanggan berhasil dihapus');
      setHapusTarget(null);
      muat();
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setMenghapus(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Manajemen Pelanggan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola data pelanggan dan pantau total belanja mereka.
          </p>
        </div>
        <button type="button" onClick={bukaTambah} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Pelanggan
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, alamat, telepon..."
              className="input pl-10"
            />
          </div>
          <p className="text-xs text-slate-400">{meta?.total ?? 0} pelanggan terdaftar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Kontak & Alamat</th>
                <th className="px-4 py-3 font-semibold">Transaksi</th>
                <th className="px-4 py-3 font-semibold">Total Belanja</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                    Memuat pelanggan...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((pelanggan) => (
                  <tr key={pelanggan.id_pelanggan} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {pelanggan.nama_pelanggan
                            .split(' ')
                            .map((kata) => kata[0])
                            .slice(0, 2)
                            .join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {pelanggan.nama_pelanggan}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {pelanggan.email || 'Belum memiliki akun login'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs flex-col gap-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-300" /> {pelanggan.telepon}
                        </span>
                        <span className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
                          <span className="line-clamp-2">{pelanggan.alamat}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">
                        {formatNumber(pelanggan.jumlah_transaksi)}
                      </span>{' '}
                      <span className="text-xs text-slate-400">transaksi</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-700">
                      {formatRupiah(pelanggan.total_belanja)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => bukaEdit(pelanggan)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit pelanggan"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHapusTarget(pelanggan)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Hapus pelanggan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-400">Pelanggan tidak ditemukan.</p>
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
        title={editing ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
        description={editing ? `ID Pelanggan #${editing.id_pelanggan}` : 'Data pelanggan akan tersimpan di database toko.'}
        size="md"
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
            <button type="submit" form="form-pelanggan" className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
            </button>
          </div>
        }
      >
        <form id="form-pelanggan" onSubmit={simpan} className="space-y-4">
          <div>
            <label className="label">Nama lengkap</label>
            <input
              name="nama_pelanggan"
              value={form.nama_pelanggan}
              onChange={ubah}
              className="input"
              placeholder="Nama pelanggan"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="label">Nomor telepon</label>
            <input
              name="telepon"
              value={form.telepon}
              onChange={ubah}
              className="input"
              placeholder="08xxxxxxxxxx"
              maxLength={15}
              required
            />
          </div>
          <div>
            <label className="label">Alamat lengkap</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={ubah}
              className="input min-h-[96px] resize-y"
              placeholder="Alamat lengkap pelanggan"
              required
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(hapusTarget)}
        onClose={() => setHapusTarget(null)}
        onConfirm={hapus}
        loading={menghapus}
        title="Hapus pelanggan?"
        message={`Data pelanggan "${hapusTarget?.nama_pelanggan || ''}" beserta seluruh transaksinya akan dihapus permanen. Tindakan ini tidak dapat diurungkan.`}
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}
