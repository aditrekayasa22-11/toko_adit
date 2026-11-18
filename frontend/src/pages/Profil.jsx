import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Clock,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiError, formatRupiah } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function Profil() {
  const { user, refresh } = useAuth();
  const pelanggan = user?.pelanggan;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telepon: pelanggan?.telepon || '',
    alamat: pelanggan?.alamat || '',
  });
  const [sandi, setSandi] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [gantiSandi, setGantiSandi] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'pelanggan') {
      api
        .get('/statistik-saya')
        .then(({ data }) => setStats(data))
        .catch(() => {});
    }
  }, [user]);

  const ubah = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const ubahSandi = (event) =>
    setSandi((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const simpan = async (event) => {
    event.preventDefault();

    if (gantiSandi && sandi.password) {
      if (sandi.password.length < 6) {
        toast.error('Password baru minimal 6 karakter');
        return;
      }
      if (sandi.password !== sandi.password_confirmation) {
        toast.error('Konfirmasi password baru tidak sama');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };

      if (user?.role === 'pelanggan') {
        payload.telepon = form.telepon;
        payload.alamat = form.alamat;
      }

      if (gantiSandi && sandi.password) {
        payload.current_password = sandi.current_password;
        payload.password = sandi.password;
        payload.password_confirmation = sandi.password_confirmation;
      }

      await api.put('/profil', payload);
      await refresh();
      setSandi({ current_password: '', password: '', password_confirmation: '' });
      setGantiSandi(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  const inisial = (user?.name || 'U')
    .split(' ')
    .map((kata) => kata[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="container-page py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-extrabold text-white shadow-glow">
            {inisial}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold sm:text-2xl">{user?.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-brand-200">
                <BadgeCheck className="h-3.5 w-3.5" /> {user?.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <form onSubmit={simpan} className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Data Profil</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nama lengkap</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={ubah}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={ubah}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              {user?.role === 'pelanggan' && (
                <>
                  <div>
                    <label className="label">Nomor telepon</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        name="telepon"
                        value={form.telepon}
                        onChange={ubah}
                        className="input pl-10"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Alamat lengkap</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <textarea
                        name="alamat"
                        value={form.alamat}
                        onChange={ubah}
                        className="input min-h-[88px] resize-y pl-10"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setGantiSandi((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <Lock className="h-4 w-4 text-slate-400" />
                {gantiSandi ? 'Batal ganti password' : 'Ganti password'}
              </button>

              {gantiSandi && (
                <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Password saat ini</label>
                    <input
                      type="password"
                      name="current_password"
                      value={sandi.current_password}
                      onChange={ubahSandi}
                      className="input"
                      placeholder="Masukkan password lama"
                    />
                  </div>
                  <div />
                  <div>
                    <label className="label">Password baru</label>
                    <input
                      type="password"
                      name="password"
                      value={sandi.password}
                      onChange={ubahSandi}
                      className="input"
                      placeholder="Min. 6 karakter"
                    />
                  </div>
                  <div>
                    <label className="label">Konfirmasi password baru</label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={sandi.password_confirmation}
                      onChange={ubahSandi}
                      className="input"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-5">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          {user?.role === 'pelanggan' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={ShoppingBag}
                  label="Transaksi"
                  value={stats?.jumlah_transaksi ?? '...'}
                  tone="brand"
                />
                <StatCard
                  icon={Clock}
                  label="Pesanan Aktif"
                  value={stats?.pesanan_aktif ?? '...'}
                  tone="amber"
                />
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-brand-600" />
                  <p className="text-sm font-bold text-slate-800">Total Belanja</p>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-brand-700">
                  {stats ? formatRupiah(stats.total_belanja) : '...'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Akumulasi dari {stats?.jumlah_transaksi ?? 0} transaksi selesai.
                </p>
              </div>
            </>
          ) : (
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-bold text-slate-800">Akses Administrator</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Akun ini memiliki akses penuh ke dashboard admin untuk mengelola produk,
                pelanggan, transaksi, pesanan, dan laporan penjualan.
              </p>
            </div>
          )}

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-bold text-slate-800">Keamanan Akun</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Gunakan password yang kuat dan jangan bagikan data akunmu kepada siapa pun.
              Toko Adit tidak pernah meminta password melalui chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
