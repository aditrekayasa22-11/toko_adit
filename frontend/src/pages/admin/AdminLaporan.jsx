import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  Loader2,
  ReceiptText,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatDate, formatNumber, formatRupiah } from '../../lib/api';
import Pagination from '../../components/Pagination';

const tanggalLokal = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const ringkasanKosong = { jumlah_transaksi: 0, total_pendapatan: 0, total_item: 0 };

export default function AdminLaporan() {
  const [tab, setTab] = useState('transaksi');

  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [nama, setNama] = useState('');
  const [page, setPage] = useState(1);
  const [transaksi, setTransaksi] = useState({ data: [], meta: null, ringkasan: ringkasanKosong });
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [cariPelanggan, setCariPelanggan] = useState('');
  const [belanja, setBelanja] = useState({ data: [], ringkasan: null });
  const [loadingBelanja, setLoadingBelanja] = useState(false);

  const muatTransaksi = useCallback(async () => {
    setLoadingTransaksi(true);
    try {
      const { data } = await api.get('/admin/laporan/transaksi', {
        params: {
          dari: dari || undefined,
          sampai: sampai || undefined,
          nama: nama || undefined,
          page,
        },
      });
      setTransaksi({
        data: data.data || [],
        meta: data.meta,
        ringkasan: data.ringkasan || ringkasanKosong,
      });
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoadingTransaksi(false);
    }
  }, [dari, sampai, nama, page]);

  useEffect(() => {
    if (tab !== 'transaksi') return;
    const timer = setTimeout(muatTransaksi, 300);
    return () => clearTimeout(timer);
  }, [tab, muatTransaksi]);

  const muatBelanja = useCallback(async () => {
    setLoadingBelanja(true);
    try {
      const { data } = await api.get('/admin/laporan/total-belanja', {
        params: { search: cariPelanggan || undefined },
      });
      setBelanja({ data: data.data || [], ringkasan: data.ringkasan });
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoadingBelanja(false);
    }
  }, [cariPelanggan]);

  useEffect(() => {
    if (tab !== 'belanja') return;
    const timer = setTimeout(muatBelanja, 300);
    return () => clearTimeout(timer);
  }, [tab, muatBelanja]);

  const aturRentang = (jenis) => {
    const sekarang = new Date();
    if (jenis === 'hari-ini') {
      setDari(tanggalLokal(sekarang));
      setSampai(tanggalLokal(sekarang));
    } else if (jenis === '7-hari') {
      const mulai = new Date(sekarang);
      mulai.setDate(mulai.getDate() - 6);
      setDari(tanggalLokal(mulai));
      setSampai(tanggalLokal(sekarang));
    } else if (jenis === 'bulan-ini') {
      setDari(tanggalLokal(new Date(sekarang.getFullYear(), sekarang.getMonth(), 1)));
      setSampai(tanggalLokal(sekarang));
    } else {
      setDari('');
      setSampai('');
    }
    setPage(1);
  };

  const ekspor = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/laporan/transaksi/export', {
        params: {
          dari: dari || undefined,
          sampai: sampai || undefined,
          nama: nama || undefined,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const disposisi = response.headers['content-disposition'] || '';
      const cocok = disposisi.match(/filename="?([^";]+)"?/);
      link.download = cocok ? cocok[1] : 'laporan-transaksi.csv';

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Laporan berhasil diunduh');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setExporting(false);
    }
  };

  const maxBelanja = Math.max(
    ...(belanja.data.map((item) => item.total_keseluruhan_belanja) || [1]),
    1
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          Laporan Penjualan
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Analisis transaksi dan total belanja pelanggan Toko Adit.
        </p>
      </div>

      <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card">
        <button
          type="button"
          onClick={() => setTab('transaksi')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'transaksi' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ReceiptText className="h-4 w-4" /> Laporan Transaksi
        </button>
        <button
          type="button"
          onClick={() => setTab('belanja')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'belanja' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4 w-4" /> Total Belanja Pelanggan
        </button>
      </div>

      {tab === 'transaksi' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Pendapatan</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatRupiah(transaksi.ringkasan.total_pendapatan)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Jumlah Transaksi</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatNumber(transaksi.ringkasan.jumlah_transaksi)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Item Terjual</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatNumber(transaksi.ringkasan.total_item)} pcs
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3">
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
                <div className="flex gap-1.5">
                  {[
                    { label: 'Hari ini', value: 'hari-ini' },
                    { label: '7 Hari', value: '7-hari' },
                    { label: 'Bulan ini', value: 'bulan-ini' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => aturRentang(item.value)}
                      className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      {item.label}
                    </button>
                  ))}
                  {(dari || sampai) && (
                    <button
                      type="button"
                      onClick={() => aturRentang('semua')}
                      className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={nama}
                    onChange={(event) => {
                      setNama(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama pelanggan..."
                    className="input pl-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={ekspor}
                  disabled={exporting}
                  className="btn-dark whitespace-nowrap px-3 py-2.5 text-xs"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Pelanggan</th>
                    <th className="px-4 py-3 font-semibold">Produk</th>
                    <th className="px-4 py-3 font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-right font-semibold">Total Harga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingTransaksi && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                        Memuat laporan...
                      </td>
                    </tr>
                  )}

                  {!loadingTransaksi &&
                    transaksi.data.map((item, index) => (
                      <tr key={item.id_transaksi} className="transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {((transaksi.meta?.current_page || 1) - 1) * (transaksi.meta?.per_page || 15) + index + 1}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(item.tanggal_transaksi, { month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {item.nama_pelanggan}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.nama_produk}</td>
                        <td className="px-4 py-3 text-slate-500">{item.jumlah} pcs</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatRupiah(item.total_harga)}
                        </td>
                      </tr>
                    ))}

                  {!loadingTransaksi && transaksi.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-400">
                          Tidak ada transaksi pada periode ini.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4">
              <Pagination meta={transaksi.meta} onChange={setPage} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Pelanggan</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatNumber(belanja.ringkasan?.total_pelanggan ?? 0)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Transaksi</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatNumber(belanja.ringkasan?.total_transaksi ?? 0)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Wallet className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Belanja</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatRupiah(belanja.ringkasan?.total_belanja ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={cariPelanggan}
                  onChange={(event) => setCariPelanggan(event.target.value)}
                  placeholder="Cari nama pelanggan..."
                  className="input pl-10"
                />
              </div>
              <p className="text-xs text-slate-400">
                Data diambil dari view total belanja pelanggan
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">No</th>
                    <th className="px-4 py-3 font-semibold">Pelanggan</th>
                    <th className="px-4 py-3 font-semibold">Jumlah Transaksi</th>
                    <th className="px-4 py-3 font-semibold">Total Belanja</th>
                    <th className="px-4 py-3 font-semibold">Proporsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingBelanja && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-brand-500" />
                        Memuat data...
                      </td>
                    </tr>
                  )}

                  {!loadingBelanja &&
                    belanja.data.map((item, index) => (
                      <tr key={item.id_pelanggan} className="transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-xs text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-700">{item.nama_pelanggan}</p>
                          <p className="text-[11px] text-slate-400">
                            ID Pelanggan #{item.id_pelanggan}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatNumber(item.jumlah_transaksi)} transaksi
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-700">
                          {formatRupiah(item.total_keseluruhan_belanja)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400"
                              style={{
                                width: `${Math.max(3, (item.total_keseluruhan_belanja / maxBelanja) * 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loadingBelanja && belanja.data.length === 0 && (
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
          </div>
        </>
      )}
    </div>
  );
}
