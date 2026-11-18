import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote, Barcode, Check, Clock3, CreditCard, FileText, LogOut,
  MapPin, Menu, Minus, PackageCheck, Pencil, Phone, Plus, Printer, QrCode,
  RefreshCw, Search, ShoppingCart, Store, Trash2, UserPlus, UserRound, Users, X, Tags, TicketPercent, Warehouse, UserCog,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { apiError, formatDateTime, formatNumber, formatRupiah, productImage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import BrandLogo from '../../components/BrandLogo';

const metode = [
  { id: 'tunai', label: 'Tunai', icon: Banknote },
  { id: 'qris', label: 'QRIS', icon: QrCode },
  { id: 'transfer', label: 'Transfer', icon: CreditCard },
];
const pelangganKosong = { nama_pelanggan: '', telepon: '', alamat: '' };
const hariIni = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const aman = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function cetakStruk(sale) {
  const popup = window.open('', '_blank', 'width=420,height=720');
  if (!popup) {
    toast.error('Izinkan pop-up browser untuk mencetak struk.');
    return;
  }
  const items = sale.items || [];
  const rows = items.map((item) => `<div class="row"><span>${aman(item.nama_produk)} × ${item.jumlah}</span><b>${formatRupiah(item.total_harga)}</b></div><div class="sub">${formatRupiah(item.harga || (item.total_harga / item.jumlah))} / pcs</div>`).join('');
  popup.document.open();
  popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Struk ${aman(sale.kode_transaksi)}</title><style>@page{size:80mm auto;margin:4mm}*{box-sizing:border-box}body{width:72mm;margin:0 auto;color:#202636;font:11px/1.45 "Courier New",monospace}.center{text-align:center}.brand{font-size:18px;font-weight:bold;letter-spacing:.08em}.brand span{color:#e85b16}.muted{color:#777;font-size:9px}.line{border:0;border-top:1px dashed #777;margin:9px 0}.row{display:flex;justify-content:space-between;gap:8px;margin-top:7px}.row span{max-width:47mm;overflow-wrap:anywhere}.sub{font-size:9px;color:#777}.total{font-size:13px;font-weight:bold}</style></head><body><div class="center"><div class="brand">TOKO <span>ADIT</span></div><div>JL. MERDEKA NO. 10 · PONOROGO</div><div class="muted">STRUK PEMBAYARAN</div></div><hr class="line"><div class="row"><span>No. Transaksi</span><b>${aman(sale.kode_transaksi)}</b></div><div class="row"><span>Tanggal</span><span>${aman(formatDateTime(sale.tanggal_transaksi))}</span></div><div class="row"><span>Kasir</span><span>${aman(sale.nama_kasir || '-')}</span></div><div class="row"><span>Pelanggan</span><span>${aman(sale.nama_pelanggan || 'Pelanggan Umum')}</span></div><hr class="line">${rows}<hr class="line">${sale.diskon_total ? `<div class="row"><span>Subtotal</span><span>${formatRupiah(sale.subtotal || (sale.total_harga + sale.diskon_total))}</span></div><div class="row"><span>Diskon</span><span>-${formatRupiah(sale.diskon_total)}</span></div>` : ''}<div class="row total"><span>TOTAL</span><b>${formatRupiah(sale.total_harga)}</b></div><div class="row"><span>Bayar (${aman((sale.metode_pembayaran || '').toUpperCase())})</span><span>${formatRupiah(sale.jumlah_bayar)}</span></div><div class="row"><span>Kembalian</span><span>${formatRupiah(sale.kembalian)}</span></div><hr class="line"><div class="center">Terima kasih telah berbelanja</div><div class="center muted">Simpan struk ini sebagai bukti pembayaran.</div><script>window.onload=()=>{window.print();window.close()}</script></body></html>`);
  popup.document.close();
}

export default function KasirPOS() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [produk, setProduk] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [keranjang, setKeranjang] = useState([]);
  const [search, setSearch] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [pelangganDipilih, setPelangganDipilih] = useState('');
  const [caraBayar, setCaraBayar] = useState('tunai');
  const [uangDiterima, setUangDiterima] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [detailSale, setDetailSale] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [sales, setSales] = useState([]);
  const [salesMeta, setSalesMeta] = useState(null);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesFrom, setSalesFrom] = useState('');
  const [salesTo, setSalesTo] = useState('');
  const [salesPage, setSalesPage] = useState(1);
  const [salesLoading, setSalesLoading] = useState(false);
  const [customerRows, setCustomerRows] = useState([]);
  const [customerMeta, setCustomerMeta] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [customerEditing, setCustomerEditing] = useState(null);
  const [customerForm, setCustomerForm] = useState(pelangganKosong);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discountType, setDiscountType] = useState('persen');
  const [discountValue, setDiscountValue] = useState('');
  const [cashierAccounts, setCashierAccounts] = useState([]);

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const [options, summary] = await Promise.all([
        api.get('/kasir/options'), api.get('/kasir/ringkasan'),
      ]);
      setProduk(options.data.produk || []);
      setPelanggan(options.data.pelanggan || []);
      setRingkasan(summary.data);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { muat(); }, [muat]);

  useEffect(() => {
    if (!['transaksi', 'riwayat'].includes(activeTab)) return undefined;
    const timer = setTimeout(async () => {
      setSalesLoading(true);
      try {
        const params = { search: salesSearch || undefined, page: salesPage };
        if (activeTab === 'transaksi') {
          params.dari = hariIni();
          params.sampai = hariIni();
        } else {
          params.dari = salesFrom || undefined;
          params.sampai = salesTo || undefined;
        }
        const { data } = await api.get('/kasir/riwayat', { params });
        setSales(data.data || []);
        setSalesMeta(data.meta || null);
      } catch (error) {
        toast.error(apiError(error));
      } finally {
        setSalesLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab, salesSearch, salesFrom, salesTo, salesPage]);

  const muatCustomers = useCallback(async () => {
    setCustomerLoading(true);
    try {
      const { data } = await api.get('/kasir/pelanggan', { params: { search: customerSearch || undefined, page: customerPage } });
      setCustomerRows(data.data || []);
      setCustomerMeta(data.meta || null);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setCustomerLoading(false);
    }
  }, [customerSearch, customerPage]);

  useEffect(() => {
    if (activeTab !== 'pelanggan') return undefined;
    const timer = setTimeout(muatCustomers, 250);
    return () => clearTimeout(timer);
  }, [activeTab, muatCustomers]);

  useEffect(() => {
    if (activeTab !== 'akun') return undefined;
    let mounted = true;
    api.get('/kasir/akun').then(({ data }) => { if (mounted) setCashierAccounts(data.data || []); })
      .catch((error) => toast.error(apiError(error)));
    return () => { mounted = false; };
  }, [activeTab]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') searchRef.current?.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const kategori = useMemo(() => ['Semua', ...new Set(produk.map((item) => item.kategori).filter(Boolean))], [produk]);
  const hasil = useMemo(() => {
    const query = search.trim().toLowerCase();
    return produk.filter((item) => {
      const cocokKategori = kategoriAktif === 'Semua' || item.kategori === kategoriAktif;
      const cocokSearch = !query || [item.nama_produk, item.kode_produk, item.kategori].some((value) => String(value || '').toLowerCase().includes(query));
      return cocokKategori && cocokSearch;
    });
  }, [produk, search, kategoriAktif]);

  const totalItem = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
  const total = keranjang.reduce((sum, item) => sum + Number(item.harga) * item.jumlah, 0);
  const discountAmount = Math.min(total, discountType === 'persen' ? total * Math.min(100, Number(discountValue || 0)) / 100 : Number(discountValue || 0));
  const totalAkhir = Math.max(0, total - discountAmount);
  const bayar = caraBayar === 'tunai' ? Number(uangDiterima || 0) : totalAkhir;
  const kembalian = Math.max(0, bayar - totalAkhir);

  const tambah = (item) => {
    if (item.stok < 1) return toast.error('Stok produk sedang habis.');
    setKeranjang((current) => {
      const found = current.find((row) => row.id_produk === item.id_produk);
      if (found) {
        if (found.jumlah >= item.stok) {
          toast.error(`Stok ${item.nama_produk} hanya ${item.stok}.`);
          return current;
        }
        return current.map((row) => row.id_produk === item.id_produk ? { ...row, jumlah: row.jumlah + 1 } : row);
      }
      return [...current, { ...item, jumlah: 1 }];
    });
  };

  const ubahJumlah = (id, delta) => setKeranjang((current) => current.flatMap((item) => {
    if (item.id_produk !== id) return [item];
    const next = item.jumlah + delta;
    if (next < 1) return [];
    if (next > item.stok) {
      toast.error(`Stok ${item.nama_produk} hanya ${item.stok}.`);
      return [item];
    }
    return [{ ...item, jumlah: next }];
  }));

  const scan = (event) => {
    if (event.key !== 'Enter') return;
    const code = search.trim().toLowerCase();
    if (!code) return;
    const found = produk.find((item) => item.kode_produk?.toLowerCase() === code || item.nama_produk.toLowerCase() === code);
    if (found) {
      tambah(found);
      setSearch('');
    } else {
      toast.error('Kode produk tidak ditemukan.');
    }
  };

  const checkout = async () => {
    if (!keranjang.length) return toast.error('Tambahkan produk ke keranjang terlebih dahulu.');
    if (caraBayar === 'tunai' && bayar < totalAkhir) return toast.error('Uang yang diterima belum mencukupi.');
    setSaving(true);
    try {
      const { data } = await api.post('/kasir/transaksi', {
        items: keranjang.map((item) => ({ id_produk: item.id_produk, jumlah: item.jumlah })),
        id_pelanggan: pelangganDipilih || null,
        metode_pembayaran: caraBayar,
        jumlah_bayar: bayar,
        tipe_diskon: discountType,
        nilai_diskon: Number(discountValue || 0),
      });
      toast.success('Pembayaran berhasil dan stok sudah diperbarui.');
      setReceipt(data.data);
      setKeranjang([]);
      setUangDiterima('');
      setDiscountValue('');
      setPelangganDipilih('');
      await muat();
    } catch (error) {
      toast.error(apiError(error));
      await muat();
    } finally {
      setSaving(false);
    }
  };

  const keluar = async () => {
    await logout();
    navigate('/login/kasir', { replace: true });
  };

  const ambilReceiptRiwayat = (sale) => setDetailSale(sale);

  const bukaTambahPelanggan = () => {
    setCustomerEditing(null);
    setCustomerForm({ ...pelangganKosong });
    setCustomerModal(true);
  };

  const bukaEditPelanggan = (item) => {
    setCustomerEditing(item);
    setCustomerForm({
      nama_pelanggan: item.nama_pelanggan,
      telepon: item.telepon || '',
      alamat: item.alamat || '',
    });
    setCustomerModal(true);
  };

  const simpanPelanggan = async (event) => {
    event.preventDefault();
    setCustomerSaving(true);
    try {
      if (customerEditing) {
        await api.put(`/kasir/pelanggan/${customerEditing.id_pelanggan}`, customerForm);
        toast.success('Data pelanggan diperbarui.');
      } else {
        await api.post('/kasir/pelanggan', customerForm);
        toast.success('Pelanggan berhasil ditambahkan.');
      }
      setCustomerModal(false);
      await Promise.all([muatCustomers(), muat()]);
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setCustomerSaving(false);
    }
  };

  return (
    <div className="cashier-shell min-h-screen bg-[#f4f6fa] text-slate-800">
      {sidebarOpen && <button type="button" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden" />}
      <aside className={`cashier-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-5">
          <Link to="/kasir" className="flex items-center gap-2.5"><BrandLogo size="sm" tone="inverted" tagline="Kasir Panel" /></Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden" aria-label="Tutup menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Menu kasir">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Menu Kasir</p>
          {[
            { id: 'toko', label: 'Toko', icon: Store },
            { id: 'cabang', label: 'Cabang', icon: Warehouse },
            { id: 'akun', label: 'Akun Kasir', icon: UserCog },
            { id: 'barang', label: 'Barang / Jasa', icon: PackageCheck },
            { id: 'kategori', label: 'Kategori', icon: Tags },
            { id: 'diskon', label: 'Diskon', icon: TicketPercent },
            { id: 'pos', label: 'Kasir / POS', icon: ShoppingCart },
            { id: 'transaksi', label: 'Transaksi Kasir', icon: FileText },
            { id: 'riwayat', label: 'Riwayat Transaksi', icon: Clock3 },
            { id: 'pelanggan', label: 'Data Pelanggan', icon: Users },
          ].map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => { if (id === 'toko') { navigate('/produk'); return; } setActiveTab(id); setSalesPage(1); setCustomerPage(1); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeTab === id ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-900/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}
        </nav>
        <div className="border-t border-white/5 p-3">
          <Link to="/produk" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"><Store className="h-[18px] w-[18px]" />Lihat Toko</Link>
          <button type="button" onClick={keluar} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"><LogOut className="h-[18px] w-[18px]" />Keluar</button>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">{(user?.name || 'K').slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-bold text-white">{user?.name}</p><p className="truncate text-[11px] text-slate-500">{user?.email}</p></div></div>
        </div>
      </aside>
      <div className="min-h-screen lg:pl-72">
      <header className="cashier-header sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex h-[72px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden" aria-label="Buka menu kasir"><Menu className="h-5 w-5" /></button>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/20"><Store className="h-5 w-5" /></span>
            <div><p className="text-lg font-extrabold tracking-tight text-slate-900">Kasir <span className="text-brand-600">Toko Adit</span></p><p className="text-xs text-slate-400">Point of sale · {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={muat} className="btn-outline !px-3 !py-2" title="Muat ulang data"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Segarkan</span></button>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white">{(user?.name || 'K').slice(0, 1).toUpperCase()}</span><span className="max-w-36 truncate text-xs font-semibold">{user?.name}</span></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <section className="cashier-welcome relative isolate overflow-hidden rounded-[24px] px-5 py-5 text-white shadow-xl sm:flex sm:items-center sm:justify-between sm:px-7">
          <div className="cashier-welcome-orb" />
          <div className="relative z-10"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-orange-100">Toko Adit · Point of Sale</span><h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Meja kasir siap melayani</h1><p className="mt-1 text-xs text-white/70">Pilih produk, proses pembayaran, lalu cetak struk dengan cepat.</p></div>
          <div className="relative z-10 mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-orange-50 backdrop-blur sm:mt-0"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />Kasir aktif</div>
        </section>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Penjualan hari ini', value: formatRupiah(ringkasan?.total_penjualan), icon: Banknote, tone: 'text-emerald-600 bg-emerald-50' },
            { label: 'Transaksi hari ini', value: formatNumber(ringkasan?.jumlah_transaksi), icon: ShoppingCart, tone: 'text-brand-600 bg-brand-50' },
            { label: 'Item terjual', value: formatNumber(ringkasan?.total_item), icon: PackageCheck, tone: 'text-blue-600 bg-blue-50' },
          ].map((card) => <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500 sm:text-sm">{card.label}</p><span className={`grid h-10 w-10 place-items-center rounded-xl ${card.tone}`}><card.icon className="h-5 w-5" /></span></div><p className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{card.value}</p></div>)}
        </div>

        {activeTab === 'pos' && <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><div className="flex items-center gap-2"><h1 className="text-xl font-extrabold tracking-tight text-slate-900">Pilih Produk</h1><span className="badge bg-brand-50 text-brand-700">{hasil.length} produk</span></div><p className="mt-1 text-sm text-slate-500">Cari nama atau SKU, atau pindai barcode lalu tekan Enter.</p></div>
                <div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={scan} className="input pl-10 pr-16" placeholder="Nama produk / barcode" /><span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400"><Barcode className="inline h-3 w-3" /> F2</span></div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">{kategori.map((item) => <button type="button" key={item} onClick={() => setKategoriAktif(item)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition ${kategoriAktif === item ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}</div>
            </div>

            {loading && !produk.length ? <div className="p-12 text-center text-sm text-slate-400">Memuat produk kasir...</div> : hasil.length ? (
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 2xl:grid-cols-4">
                {hasil.map((item) => {
                  const qty = keranjang.find((row) => row.id_produk === item.id_produk)?.jumlah || 0;
                  const habis = item.stok < 1;
                  return <button type="button" key={item.id_produk} disabled={habis} onClick={() => tambah(item)} className={`group relative overflow-hidden rounded-2xl border bg-white p-3 text-left transition ${habis ? 'cursor-not-allowed border-slate-100 opacity-55' : 'border-slate-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5'}`}>
                    {qty > 0 && <span className="absolute right-2 top-2 z-10 grid h-7 min-w-7 place-items-center rounded-full bg-brand-600 px-2 text-xs font-extrabold text-white shadow-md">{qty}</span>}
                    <div className="grid h-36 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/60"><img src={productImage(item.gambar)} alt={item.nama_produk} className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105" /></div>
                    <div className="px-1 pb-1 pt-3"><p className="truncate text-sm font-bold text-slate-800">{item.nama_produk}</p><div className="mt-1 flex items-center justify-between gap-2"><span className="text-sm font-extrabold text-brand-700">{formatRupiah(item.harga)}</span><span className={`text-[11px] font-semibold ${habis ? 'text-rose-500' : item.stok <= 5 ? 'text-amber-600' : 'text-slate-400'}`}>{habis ? 'Habis' : `Stok ${item.stok}`}</span></div><p className="mt-1 truncate font-mono text-[10px] text-slate-400">{item.kode_produk || item.kategori}</p></div>
                    <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-700 opacity-0 transition group-hover:opacity-100"><Plus className="h-4 w-4" /></span>
                  </button>;
                })}
              </div>
            ) : <div className="p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-600">Produk tidak ditemukan</p><button type="button" onClick={() => { setSearch(''); setKategoriAktif('Semua'); }} className="mt-2 text-sm font-semibold text-brand-700">Hapus pencarian</button></div>}
          </section>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-[92px]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><ShoppingCart className="h-4 w-4 text-brand-600" /> Keranjang</h2><p className="mt-0.5 text-xs text-slate-400">{totalItem} item di transaksi ini</p></div>{keranjang.length > 0 && <button type="button" onClick={() => setKeranjang([])} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Kosongkan</button>}</div>
            <div className="max-h-[320px] min-h-24 divide-y divide-slate-100 overflow-y-auto px-5">
              {keranjang.length ? keranjang.map((item) => <div key={item.id_produk} className="flex gap-3 py-3"><img src={productImage(item.gambar)} alt="" className="h-12 w-12 rounded-xl bg-slate-50 object-contain p-1" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{item.nama_produk}</p><p className="mt-0.5 text-xs text-slate-500">{formatRupiah(item.harga)}</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => ubahJumlah(item.id_produk, -1)} className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"><Minus className="h-3 w-3" /></button><span className="w-5 text-center text-xs font-bold">{item.jumlah}</span><button type="button" onClick={() => ubahJumlah(item.id_produk, 1)} className="grid h-6 w-6 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"><Plus className="h-3 w-3" /></button><button type="button" onClick={() => setKeranjang((current) => current.filter((row) => row.id_produk !== item.id_produk))} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500" aria-label={`Hapus ${item.nama_produk}`}><Trash2 className="h-3.5 w-3.5" /></button><span className="text-xs font-bold text-slate-800">{formatRupiah(item.harga * item.jumlah)}</span></div></div></div>) : <div className="py-8 text-center"><ShoppingCart className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs text-slate-400">Keranjang masih kosong</p></div>}
            </div>
            <div className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-5">
              <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600"><UserRound className="h-3.5 w-3.5" /> Pelanggan</span><select value={pelangganDipilih} onChange={(event) => setPelangganDipilih(event.target.value)} className="input bg-white"><option value="">Pelanggan umum</option>{pelanggan.map((item) => <option key={item.id_pelanggan} value={item.id_pelanggan}>{item.nama_pelanggan} · {item.telepon}</option>)}</select></label>
              <div><p className="mb-2 text-xs font-bold text-slate-600">Metode pembayaran</p><div className="grid grid-cols-3 gap-2">{metode.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setCaraBayar(id)} className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${caraBayar === id ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div>
              <div className="space-y-2 border-t border-dashed border-slate-200 pt-3"><div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><span>{formatRupiah(total)}</span></div>{discountAmount > 0 && <div className="flex justify-between text-sm font-semibold text-emerald-700"><span>Diskon</span><span>− {formatRupiah(discountAmount)}</span></div>}<div className="flex justify-between text-lg font-extrabold text-slate-900"><span>Total</span><span>{formatRupiah(totalAkhir)}</span></div></div>
              <button type="button" onClick={() => setActiveTab('diskon')} className="flex w-full items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-white px-3 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-50"><TicketPercent className="h-4 w-4" />Atur diskon transaksi</button>
              {caraBayar === 'tunai' && <><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Uang diterima</span><input type="number" min={0} step={1000} value={uangDiterima} onChange={(event) => setUangDiterima(event.target.value)} className="input bg-white" placeholder="Masukkan nominal pembayaran" /></label><div className="flex justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm"><span className="font-semibold text-emerald-700">Kembalian</span><span className="font-extrabold text-emerald-800">{formatRupiah(kembalian)}</span></div></>}
              <button type="button" onClick={checkout} disabled={saving || loading || !keranjang.length || (caraBayar === 'tunai' && bayar < totalAkhir)} className="btn-primary w-full !rounded-xl !py-3.5 text-sm"><Check className="h-4 w-4" />{saving ? 'Memproses pembayaran...' : 'Selesaikan Pembayaran'}</button>
              <p className="text-center text-[10px] text-slate-400">Stok diperbarui otomatis setelah transaksi berhasil.</p>
            </div>
          </aside>
        </div>}

        {activeTab === 'cabang' && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Warehouse className="h-6 w-6" /></span><div><h2 className="text-xl font-extrabold text-slate-900">Cabang toko</h2><p className="mt-1 text-sm text-slate-500">Informasi cabang yang melayani transaksi pada perangkat ini.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Nama cabang</p><p className="mt-2 font-bold text-slate-800">Toko Adit · Pusat</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status operasional</p><p className="mt-2 inline-flex items-center gap-2 font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Aktif</p></div></div><p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Pengaturan cabang multi-lokasi belum tersedia pada database toko saat ini. POS menggunakan stok produk toko pusat.</p></section>}

        {activeTab === 'akun' && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-extrabold text-slate-900">Akun Kasir</h2><p className="mt-1 text-xs text-slate-500">Daftar akun kasir yang dapat mengakses meja POS.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Hak akses</th><th className="px-5 py-3">Dibuat</th></tr></thead><tbody className="divide-y divide-slate-100">{cashierAccounts.map((account) => <tr key={account.id}><td className="px-5 py-4 font-semibold">{account.name}</td><td className="px-5 py-4 text-slate-500">{account.email}</td><td className="px-5 py-4"><span className="badge bg-emerald-50 text-emerald-700">Kasir</span></td><td className="px-5 py-4 text-slate-500">{account.created_at ? formatDateTime(account.created_at) : '—'}</td></tr>)}{!cashierAccounts.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Memuat atau belum ada akun kasir.</td></tr>}</tbody></table></div><div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">Pembuatan akun dan pengaturan sandi dikelola oleh admin toko.</div></section>}

        {activeTab === 'barang' && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="font-extrabold text-slate-900">Barang / Jasa</h2><p className="mt-1 text-xs text-slate-500">Katalog kasir dan ketersediaan stok.</p></div><span className="badge bg-brand-50 text-brand-700">{produk.length} produk</span></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Produk</th><th className="px-5 py-3">Kode / SKU</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Harga</th><th className="px-5 py-3">Stok</th></tr></thead><tbody className="divide-y divide-slate-100">{produk.map((item) => <tr key={item.id_produk}><td className="px-5 py-3 font-semibold">{item.nama_produk}</td><td className="px-5 py-3 font-mono text-xs text-slate-500">{item.kode_produk || '—'}</td><td className="px-5 py-3">{item.kategori || 'Umum'}</td><td className="px-5 py-3 font-semibold">{formatRupiah(item.harga)}</td><td className="px-5 py-3">{item.stok}</td></tr>)}{!produk.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Belum ada produk.</td></tr>}</tbody></table></div></section>}

        {activeTab === 'kategori' && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-slate-900">Kategori Barang / Jasa</h2><p className="mt-1 text-xs text-slate-500">Kategori diambil dari data produk toko dan dapat dipakai untuk menyaring katalog POS.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kategori.filter((item) => item !== 'Semua').map((name) => <button key={name} type="button" onClick={() => { setKategoriAktif(name); setActiveTab('pos'); }} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50"><span className="flex items-center gap-3"><Tags className="h-4 w-4 text-brand-600" /><span className="font-bold text-slate-800">{name}</span></span><span className="text-xs text-slate-400">{produk.filter((item) => item.kategori === name).length} produk</span></button>)}{kategori.length <= 1 && <p className="text-sm text-slate-400">Belum ada kategori produk.</p>}</div></section>}

        {activeTab === 'diskon' && <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><TicketPercent className="h-6 w-6" /></span><div><h2 className="text-xl font-extrabold text-slate-900">Diskon transaksi</h2><p className="mt-1 text-sm text-slate-500">Atur potongan untuk keranjang aktif. Nilainya divalidasi ulang saat pembayaran.</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block"><span className="label">Jenis diskon</span><select value={discountType} onChange={(event) => setDiscountType(event.target.value)} className="input"><option value="persen">Persentase (%)</option><option value="nominal">Nominal (Rp)</option></select></label><label className="block"><span className="label">Nilai diskon</span><input type="number" min="0" max={discountType === 'persen' ? 100 : undefined} step={discountType === 'persen' ? 1 : 500} value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} className="input" placeholder={discountType === 'persen' ? 'Contoh: 10' : 'Contoh: 15000'} /></label></div><div className="mt-5 rounded-xl bg-slate-50 p-4"><div className="flex justify-between text-sm text-slate-500"><span>Subtotal keranjang</span><span>{formatRupiah(total)}</span></div><div className="mt-2 flex justify-between text-sm font-semibold text-emerald-700"><span>Potongan</span><span>− {formatRupiah(discountAmount)}</span></div><div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-extrabold text-slate-900"><span>Total setelah diskon</span><span>{formatRupiah(totalAkhir)}</span></div></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setActiveTab('pos')} className="btn-primary">Terapkan ke keranjang</button><button type="button" onClick={() => setDiscountValue('')} className="btn-outline">Hapus diskon</button></div></section>}

        {['transaksi', 'riwayat'].includes(activeTab) && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5 sm:py-4">
            <div><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><Clock3 className="h-4 w-4 text-brand-600" />{activeTab === 'transaksi' ? 'Data Transaksi Hari Ini' : 'Riwayat Transaksi'}</h2><p className="mt-1 text-xs text-slate-400">{salesMeta?.total ?? 0} transaksi tercatat</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={salesSearch} onChange={(event) => { setSalesSearch(event.target.value); setSalesPage(1); }} className="input pl-9" placeholder="Cari kode, pelanggan, produk" /></div>
              {activeTab === 'riwayat' && <div className="flex gap-2"><input type="date" value={salesFrom} onChange={(event) => { setSalesFrom(event.target.value); setSalesPage(1); }} className="input" aria-label="Dari tanggal" /><input type="date" value={salesTo} onChange={(event) => { setSalesTo(event.target.value); setSalesPage(1); }} className="input" aria-label="Sampai tanggal" /></div>}
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-bold">No. Transaksi</th><th className="px-5 py-3 font-bold">Pelanggan</th><th className="px-5 py-3 font-bold">Kasir</th><th className="px-5 py-3 font-bold">Tanggal</th><th className="px-5 py-3 font-bold">Item</th><th className="px-5 py-3 font-bold">Pembayaran</th><th className="px-5 py-3 font-bold">Total</th><th className="px-5 py-3 text-right font-bold">Struk</th></tr></thead><tbody className="divide-y divide-slate-100">{salesLoading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">Memuat data transaksi...</td></tr> : sales.map((sale) => <tr key={sale.kode_transaksi} className="hover:bg-slate-50/70"><td className="px-5 py-3 font-mono text-xs font-bold text-brand-700">{sale.kode_transaksi}</td><td className="px-5 py-3 text-slate-600">{sale.nama_pelanggan}</td><td className="px-5 py-3 text-slate-500">{sale.nama_kasir || '—'}</td><td className="px-5 py-3 text-xs text-slate-500">{sale.tanggal_transaksi}</td><td className="px-5 py-3 text-slate-500">{sale.items?.reduce((sum, item) => sum + item.jumlah, 0) || 0} item</td><td className="px-5 py-3"><span className="badge bg-slate-100 text-slate-600">{sale.metode_pembayaran}</span></td><td className="px-5 py-3 font-bold">{formatRupiah(sale.total_harga)}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => ambilReceiptRiwayat(sale)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700" title="Lihat/cetak struk"><Printer className="h-4 w-4" /></button></td></tr>)}{!salesLoading && !sales.length && <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">Tidak ada transaksi pada filter ini.</td></tr>}</tbody></table></div>
          <Pagination meta={salesMeta} onChange={setSalesPage} className="p-4 sm:px-5" />
        </section>}

        {activeTab === 'pelanggan' && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5 sm:py-4">
            <div><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><Users className="h-4 w-4 text-brand-600" /> Data Pelanggan</h2><p className="mt-1 text-xs text-slate-400">Kelola kontak pelanggan dan lihat ringkasan belanjanya.</p></div>
            <div className="flex gap-2"><div className="relative sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={customerSearch} onChange={(event) => { setCustomerSearch(event.target.value); setCustomerPage(1); }} className="input pl-9" placeholder="Cari nama atau telepon" /></div><button type="button" onClick={bukaTambahPelanggan} className="btn-primary shrink-0"><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Tambah</span></button></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-bold">Pelanggan</th><th className="px-5 py-3 font-bold">Telepon</th><th className="px-5 py-3 font-bold">Alamat</th><th className="px-5 py-3 font-bold">Transaksi</th><th className="px-5 py-3 font-bold">Total Belanja</th><th className="px-5 py-3 text-right font-bold">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{customerLoading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Memuat data pelanggan...</td></tr> : customerRows.map((item) => <tr key={item.id_pelanggan} className="hover:bg-slate-50/70"><td className="px-5 py-3 font-semibold text-slate-800">{item.nama_pelanggan}</td><td className="px-5 py-3 text-slate-600"><span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{item.telepon}</span></td><td className="max-w-sm px-5 py-3 text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{item.alamat}</span></td><td className="px-5 py-3 text-slate-600">{formatNumber(item.jumlah_transaksi)}</td><td className="px-5 py-3 font-bold text-brand-700">{formatRupiah(item.total_belanja)}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => bukaEditPelanggan(item)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700" aria-label="Edit data pelanggan"><Pencil className="h-4 w-4" /></button></td></tr>)}{!customerLoading && !customerRows.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Data pelanggan tidak ditemukan.</td></tr>}</tbody></table></div>
          <Pagination meta={customerMeta} onChange={setCustomerPage} className="p-4 sm:px-5" />
        </section>}
      </main>
      </div>

      <Modal open={customerModal} onClose={() => setCustomerModal(false)} title={customerEditing ? 'Edit Pelanggan' : 'Tambah Pelanggan'} description="Data pelanggan dipakai untuk transaksi dan catatan belanja." footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setCustomerModal(false)} className="btn-outline">Batal</button><button type="submit" form="form-kasir-pelanggan" disabled={customerSaving} className="btn-primary">{customerSaving ? 'Menyimpan...' : customerEditing ? 'Simpan Perubahan' : 'Tambah Pelanggan'}</button></div>}>
        <form id="form-kasir-pelanggan" onSubmit={simpanPelanggan} className="space-y-4">
          <div><label className="label">Nama pelanggan</label><input name="nama_pelanggan" value={customerForm.nama_pelanggan} onChange={(event) => setCustomerForm((current) => ({ ...current, nama_pelanggan: event.target.value }))} className="input" maxLength={100} required placeholder="Nama lengkap" /></div>
          <div><label className="label">Nomor telepon</label><input name="telepon" value={customerForm.telepon} onChange={(event) => setCustomerForm((current) => ({ ...current, telepon: event.target.value }))} className="input" maxLength={15} required placeholder="08xxxxxxxxxx" /></div>
          <div><label className="label">Alamat</label><textarea name="alamat" value={customerForm.alamat} onChange={(event) => setCustomerForm((current) => ({ ...current, alamat: event.target.value }))} className="input min-h-24 resize-y" maxLength={1000} required placeholder="Alamat pelanggan" /></div>
        </form>
      </Modal>

      <Modal open={Boolean(receipt)} onClose={() => setReceipt(null)} title="Pembayaran berhasil" description="Transaksi tersimpan. Cetak struk atau mulai transaksi baru." footer={<div className="flex flex-col-reverse justify-between gap-2 sm:flex-row"><button type="button" onClick={() => setReceipt(null)} className="btn-outline">Tutup</button><div className="flex gap-2"><button type="button" onClick={() => { setReceipt(null); setSearch(''); searchRef.current?.focus(); }} className="btn-outline"><Plus className="h-4 w-4" /> Transaksi baru</button><button type="button" onClick={() => cetakStruk(receipt)} className="btn-primary"><Printer className="h-4 w-4" /> Cetak struk</button></div></div>}>
        {receipt && <RingkasanStruk sale={receipt} />}
      </Modal>

      <Modal open={Boolean(detailSale)} onClose={() => setDetailSale(null)} title="Detail transaksi" description={detailSale?.kode_transaksi} footer={<div className="flex justify-end gap-2"><button type="button" onClick={() => setDetailSale(null)} className="btn-outline">Tutup</button><button type="button" onClick={() => cetakStruk(detailSale)} className="btn-primary"><Printer className="h-4 w-4" /> Cetak ulang</button></div>}>
        {detailSale && <RingkasanStruk sale={detailSale} />}
      </Modal>
    </div>
  );
}

function RingkasanStruk({ sale }) {
  return <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-slate-300 bg-white p-5 font-mono text-xs text-slate-700"><div className="text-center"><p className="text-lg font-black tracking-widest">TOKO <span className="text-brand-600">ADIT</span></p><p className="mt-1 text-[10px] text-slate-400">JL. MERDEKA NO. 10 · PONOROGO</p></div><div className="my-3 border-t border-dashed border-slate-300" /><div className="space-y-1 text-[10px]"><p>No: <b>{sale.kode_transaksi}</b></p><p>Waktu: {formatDateTime(sale.tanggal_transaksi)}</p><p>Pelanggan: {sale.nama_pelanggan || 'Pelanggan Umum'}</p><p>Kasir: {sale.nama_kasir || '-'}</p></div><div className="my-3 border-t border-dashed border-slate-300" /><div className="space-y-3">{sale.items?.map((item, index) => <div key={`${item.nama_produk}-${index}`}><div className="flex justify-between gap-2"><span className="max-w-[65%] break-words">{item.nama_produk} × {item.jumlah}</span><b>{formatRupiah(item.total_harga)}</b></div><p className="mt-0.5 text-[10px] text-slate-400">@ {formatRupiah(item.harga || item.total_harga / item.jumlah)}</p></div>)}</div><div className="my-3 border-t border-dashed border-slate-300" /><div className="space-y-1.5">{sale.diskon_total > 0 && <><div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(sale.subtotal || (sale.total_harga + sale.diskon_total))}</span></div><div className="flex justify-between text-emerald-700"><span>Diskon</span><span>− {formatRupiah(sale.diskon_total)}</span></div></>}<div className="flex justify-between text-sm font-black"><span>TOTAL</span><span>{formatRupiah(sale.total_harga)}</span></div><div className="flex justify-between"><span>Bayar ({sale.metode_pembayaran})</span><span>{formatRupiah(sale.jumlah_bayar)}</span></div><div className="flex justify-between"><span>Kembalian</span><span>{formatRupiah(sale.kembalian)}</span></div></div><div className="my-3 border-t border-dashed border-slate-300" /><p className="text-center text-[10px]">Terima kasih telah berbelanja.</p></div>;
}
