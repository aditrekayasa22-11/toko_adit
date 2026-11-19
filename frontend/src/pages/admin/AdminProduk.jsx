import { useCallback, useEffect, useState } from 'react';
import { Loader2, Package, Pencil, Plus, Printer, ReceiptText, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatNumber, formatRupiah, gambarProduk, productImage } from '../../lib/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

const kosong = {
  kode_produk: '',
  nama_produk: '',
  kategori: 'Atasan',
  harga: '',
  stok: '',
  deskripsi: '',
  gambar: 'atasan.svg',
};

const gambarByKategori = {
  Atasan: 'atasan.svg',
  Bawahan: 'bawahan.svg',
  Sepatu: 'sepatu.svg',
  Tas: 'tas.svg',
  Aksesoris: 'aksesoris.svg',
  Perawatan: 'parfum.svg',
};

function StokBadge({ stok }) {
  const kelas =
    stok <= 0
      ? 'bg-rose-50 text-rose-600'
      : stok <= 10
        ? 'bg-amber-50 text-amber-700'
        : 'bg-emerald-50 text-emerald-700';
  return <span className={`badge ${kelas}`}>{stok} pcs</span>;
}

export default function AdminProduk() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(kosong);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const [hapusTarget, setHapusTarget] = useState(null);
  const [menghapus, setMenghapus] = useState(false);
  const [strukProduk, setStrukProduk] = useState(null);

  useEffect(() => {
    if (!fotoFile) {
      setFotoPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(fotoFile);
    setFotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [fotoFile]);

  const cetakStruk = () => {
    if (!strukProduk) return;
    const popup = window.open('', '_blank', 'width=420,height=700');
    if (!popup) {
      toast.error('Izinkan pop-up browser untuk mencetak struk.');
      return;
    }
    const aman = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
    const harga = aman(formatRupiah(strukProduk.harga));
    const sekarang = new Date();
    const tanggal = sekarang.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    }).replaceAll('/', '. ');
    const jam = sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const waktu = aman(`${tanggal} - ${jam}`);
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Struk Harga - ${aman(strukProduk.nama_produk)}</title><style>
      @page{size:80mm auto;margin:4mm}*{box-sizing:border-box}body{width:72mm;margin:0 auto;color:#222;font:10px/1.35 "Courier New",monospace}.receipt{padding:1mm 0;text-align:center}.logo{display:block;width:16mm;height:16mm;margin:0 auto 2mm;border-radius:3mm}.brand{font-size:18px;font-weight:bold;letter-spacing:.5px}.brand span{color:#a9713f}.subtitle{font-size:9px;letter-spacing:1px}.location{margin-top:7px;font-size:10px}.rule{border:0;border-top:1px dashed #555;margin:7px 0}.title{font-size:11px;font-weight:bold;letter-spacing:.8px}.meta{display:flex;justify-content:space-between;text-align:left}.items-head,.item{display:grid;grid-template-columns:minmax(0,1fr) 8mm 15mm 16mm;gap:1mm;text-align:right}.items-head{font-weight:bold}.item-name{overflow-wrap:anywhere;text-align:left}.summary{width:100%;margin-top:4px}.summary-row{display:flex;justify-content:space-between;gap:8px;text-align:right}.summary-label{flex:1;text-align:right;letter-spacing:.6px}.summary-value{width:19mm}.grand{font-weight:bold}.footer{letter-spacing:.4px}.small{font-size:9px}@media print{body{width:72mm}}
      </style></head><body><main class="receipt"><img class="logo" src="${window.location.origin}/logo-badge.svg" alt="Fashion Store"/><div class="brand">FASHION <span>STORE</span></div><div class="location">JL. MERDEKA NO. 10 - PONOROGO</div><hr class="rule"><div class="meta"><span>${waktu}</span><span>PRODUK-${aman(strukProduk.id_produk)}</span></div><hr class="rule"><div class="items-head"><span>PRODUK</span><span>QTY</span><span>HARGA</span><span>JUMLAH</span></div><div class="item"><span class="item-name">${aman(strukProduk.nama_produk)}</span><span>1</span><span>${harga}</span><span>${harga}</span></div><div class="item small"><span class="item-name">${aman(strukProduk.kategori)} · stok ${aman(strukProduk.stok)}</span></div><hr class="rule"><div class="summary"><div class="summary-row"><span class="summary-label">DISKON :</span><span class="summary-value">0</span></div><div class="summary-row"><span class="summary-label">HARGA JUAL :</span><span class="summary-value">${harga}</span></div><div class="summary-row"><span class="summary-label">DISKON PROMO :</span><span class="summary-value">(0)</span></div><hr class="rule"><div class="summary-row grand"><span class="summary-label">TOTAL :</span><span class="summary-value">${harga}</span></div></div><hr class="rule"><div class="footer">TERIMA KASIH. SELAMAT BERBELANJA KEMBALI</div><div class="footer">======= LAYANAN PELANGGAN FASHION STORE =======</div><div class="small">CALL 0812-3456-7891</div><div class="small">EMAIL : halo@tokokita.id</div><div class="footer">======= INFO PRODUK &amp; PROMO =======</div><div class="small">HARGA DAPAT BERUBAH SEWAKTU-WAKTU</div></main></body></html>`);
    popup.document.close();
    popup.focus();
    window.setTimeout(() => {
      popup.print();
      popup.close();
    }, 250);
  };

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/produk', {
        params: { search, kategori: kategoriFilter || undefined, page },
      });
      setRows(data.data || []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, [search, kategoriFilter, page]);

  useEffect(() => {
    const timer = setTimeout(muat, 300);
    return () => clearTimeout(timer);
  }, [muat]);

  useEffect(() => {
    api
      .get('/kategori')
      .then(({ data }) => setKategori(data.data || []))
      .catch(() => {});
  }, []);

  const bukaTambah = () => {
    setEditing(null);
    setForm({ ...kosong });
    setFotoFile(null);
    setModalOpen(true);
  };

  const bukaEdit = (produk) => {
    setEditing(produk);
    setForm({
      kode_produk: produk.kode_produk || '',
      nama_produk: produk.nama_produk,
      kategori: produk.kategori,
      harga: String(produk.harga),
      stok: String(produk.stok),
      deskripsi: produk.deskripsi || '',
      gambar: produk.gambar?.includes('/storage/')
        ? produk.gambar.split('/storage/').pop()
        : produk.gambar || 'atasan.svg',
    });
    setFotoFile(null);
    setModalOpen(true);
  };

  const ubah = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'kategori' && gambarByKategori[value]) {
        next.gambar = gambarByKategori[value];
      }
      return next;
    });
  };

  const simpan = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries({ ...form, harga: Number(form.harga), stok: Number(form.stok) }).forEach(([key, value]) => {
        if (key === 'gambar' && fotoFile) {
          payload.append(key, fotoFile);
        } else if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      if (editing) {
        payload.append('_method', 'PUT');
        await api.post(`/admin/produk/${editing.id_produk}`, payload);
        toast.success('Produk berhasil diperbarui');
      } else {
        await api.post('/admin/produk', payload);
        toast.success('Produk berhasil ditambahkan');
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
      await api.delete(`/admin/produk/${hapusTarget.id_produk}`);
      toast.success('Produk berhasil dihapus');
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
            Manajemen Produk
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola katalog produk, harga, stok, dan gambar produk toko.
          </p>
        </div>
        <button type="button" onClick={bukaTambah} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Produk
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
              placeholder="Cari nama, kode, atau kategori..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={kategoriFilter}
              onChange={(event) => {
                setKategoriFilter(event.target.value);
                setPage(1);
              }}
              className="input w-auto cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {kategori.map((item) => (
                <option key={item.kategori} value={item.kategori}>
                  {item.kategori}
                </option>
              ))}
            </select>
            <span className="hidden whitespace-nowrap text-xs text-slate-400 sm:block">
              {meta?.total ?? 0} produk
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Kode / SKU</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Harga</th>
                <th className="px-4 py-3 font-semibold">Stok</th>
                <th className="px-4 py-3 font-semibold">Terjual</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                    Memuat produk...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((produk) => (
                  <tr key={produk.id_produk} className="transition hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={productImage(produk.gambar)}
                          alt={produk.nama_produk}
                          className="h-11 w-11 rounded-xl bg-brand-50 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">{produk.nama_produk}</p>
                          <p className="text-[11px] text-slate-400">#{produk.id_produk}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {produk.kode_produk || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600">{produk.kategori}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {formatRupiah(produk.harga)}
                    </td>
                    <td className="px-4 py-3">
                      <StokBadge stok={produk.stok} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatNumber(produk.terjual)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStrukProduk(produk)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label={`Cetak struk harga ${produk.nama_produk}`}
                          title="Struk harga"
                        >
                          <ReceiptText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => bukaEdit(produk)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit produk"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHapusTarget(produk)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Hapus produk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Package className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-400">Produk tidak ditemukan.</p>
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
        title={editing ? 'Edit Produk' : 'Tambah Produk Baru'}
        description="Lengkapi informasi produk dengan benar."
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
            <button type="submit" form="form-produk" className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        }
      >
        <form id="form-produk" onSubmit={simpan} className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
            <img
              src={fotoPreview || productImage(form.gambar)}
              alt="Pratinjau produk"
              className="h-16 w-16 rounded-xl bg-white object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {form.nama_produk || 'Nama produk'}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {form.kategori} · {form.harga ? formatRupiah(form.harga) : 'Harga belum diisi'}
              </p>
            </div>
          </div>

          <div>
            <label className="label">Kode produk / Barcode / SKU</label>
            <input
              name="kode_produk"
              value={form.kode_produk}
              onChange={ubah}
              className="input"
              placeholder="Contoh: SKU-AT-001 atau 8991234567890"
              maxLength={64}
            />
            <p className="mt-1 text-xs text-slate-400">Opsional. Kode harus unik jika diisi.</p>
          </div>

          <div>
            <label className="label">Nama produk</label>
            <input
              name="nama_produk"
              value={form.nama_produk}
              onChange={ubah}
              className="input"
              placeholder="Contoh: Kemeja Flanel"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Kategori</label>
              <select name="kategori" value={form.kategori} onChange={ubah} className="input" required>
                {gambarProduk.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gambar produk</label>
              <select name="gambar" value={gambarProduk.some((item) => item.value === form.gambar) ? form.gambar : gambarByKategori[form.kategori]} onChange={(event) => {
                setFotoFile(null);
                ubah(event);
              }} className="input" disabled={Boolean(fotoFile)}>
                {gambarProduk.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} (gambar bawaan)
                  </option>
                ))}
              </select>
              <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/50">
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-700">{fotoFile?.name || 'Pilih foto dari perangkat'}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">JPG, PNG, atau WebP · Maks. 5 MB</span>
                </span>
                <span className="shrink-0 rounded-lg bg-white px-3 py-2 font-semibold text-brand-700 shadow-sm">Pilih foto</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                      toast.error('Gunakan foto JPG, PNG, atau WebP.');
                      event.target.value = '';
                      return;
                    }
                    if (file && file.size > 5 * 1024 * 1024) {
                      toast.error('Ukuran foto maksimal 5 MB.');
                      event.target.value = '';
                      return;
                    }
                    setFotoFile(file || null);
                  }}
                />
              </label>
              {fotoFile && (
                <button type="button" onClick={() => setFotoFile(null)} className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700">
                  Hapus foto pilihan
                </button>
              )}
            </div>
            <div>
              <label className="label">Harga (Rp)</label>
              <input
                type="number"
                name="harga"
                value={form.harga}
                onChange={ubah}
                className="input"
                min={0}
                placeholder="125000"
                required
              />
            </div>
            <div>
              <label className="label">Stok</label>
              <input
                type="number"
                name="stok"
                value={form.stok}
                onChange={ubah}
                className="input"
                min={0}
                placeholder="20"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Deskripsi produk</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={ubah}
              className="input min-h-[96px] resize-y"
              placeholder="Jelaskan bahan, ukuran, dan keunggulan produk..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(strukProduk)}
        onClose={() => setStrukProduk(null)}
        title="Struk Harga Produk"
        description="Pratinjau struk harga thermal sebelum dicetak."
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-outline" onClick={() => setStrukProduk(null)}>
              Tutup
            </button>
            <button type="button" className="btn-primary" onClick={cetakStruk}>
              <Printer className="h-4 w-4" /> Cetak Struk
            </button>
          </div>
        }
      >
        {strukProduk && (
          <div className="mx-auto w-full max-w-[310px] border border-dashed border-slate-300 bg-white px-5 py-6 font-mono text-[10px] leading-relaxed text-slate-800 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-[16px] border border-amber-800/40 bg-[#20120a] shadow-md shadow-amber-900/20">
                <img src="/logo-emblem.svg" alt="" className="h-11 w-11" />
              </div>
              <p className="text-lg font-extrabold tracking-wide">FASHION <span className="text-amber-700">STORE</span></p>
              <p className="text-[9px] tracking-widest">FASHION &amp; AKSESORIS</p>
              <p className="mt-2 text-[9px] tracking-wide">JL. MERDEKA NO. 10 - PONOROGO</p>
            </div>
            <div className="my-2 border-t border-dashed border-slate-500" />
            <div className="flex justify-between gap-2"><span>{new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}</span><span>PRODUK-{strukProduk.id_produk}</span></div>
            <div className="my-2 border-t border-dashed border-slate-500" />
            <div className="grid grid-cols-[1fr_30px_64px_72px] gap-x-1 text-right font-bold"><span className="text-left">PRODUK</span><span>QTY</span><span>HARGA</span><span>JUMLAH</span></div>
            <div className="mt-1 grid grid-cols-[1fr_30px_64px_72px] gap-x-1 text-right"><span className="break-words text-left">{strukProduk.nama_produk}</span><span>1</span><span>{formatRupiah(strukProduk.harga)}</span><span>{formatRupiah(strukProduk.harga)}</span></div>
            <div className="mt-1 text-left text-[9px]">{strukProduk.kategori} · stok {formatNumber(strukProduk.stok)}</div>
            <div className="my-2 border-t border-dashed border-slate-500" />
            <div className="flex justify-between gap-2"><span className="flex-1 text-right">DISKON :</span><span className="w-[76px] text-right">0</span></div>
            <div className="flex justify-between gap-2 font-bold"><span className="flex-1 text-right">HARGA JUAL :</span><span className="w-[76px] text-right">{formatRupiah(strukProduk.harga)}</span></div>
            <div className="flex justify-between gap-2"><span className="flex-1 text-right">DISKON PROMO :</span><span className="w-[76px] text-right">(0)</span></div>
            <div className="my-2 border-t border-dashed border-slate-500" />
            <div className="flex justify-between gap-2 text-xs font-extrabold"><span className="flex-1 text-right">TOTAL :</span><span className="w-[76px] text-right">{formatRupiah(strukProduk.harga)}</span></div>
            <div className="my-2 border-t border-dashed border-slate-500" />
            <div className="text-center font-semibold">TERIMA KASIH. SELAMAT BERBELANJA KEMBALI</div>
            <div className="text-center">======= LAYANAN PELANGGAN FASHION STORE =======</div>
            <div className="text-center text-[9px]">CALL 0812-3456-7891</div>
            <div className="text-center text-[9px]">EMAIL : halo@tokokita.id</div>
            <div className="text-center">======= INFO PRODUK &amp; PROMO =======</div>
            <div className="text-center text-[9px]">HARGA DAPAT BERUBAH SEWAKTU-WAKTU</div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(hapusTarget)}
        onClose={() => setHapusTarget(null)}
        onConfirm={hapus}
        loading={menghapus}
        title="Hapus produk?"
        message={`Produk "${hapusTarget?.nama_produk || ''}" akan dihapus dari katalog. Riwayat transaksi lama tetap tersimpan.`}
        confirmLabel="Ya, hapus"
      />
    </div>
  );
}
