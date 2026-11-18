import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import AuthShell from '../components/AuthShell';

const akunDemo = [
  { label: 'Admin', email: 'admin@tokokita.id', password: 'admin123' },
  { label: 'Kasir', email: 'kasir@tokokita.id', password: 'kasir123' },
  { label: 'Pelanggan', email: 'budi.santoso@tokokita.id', password: 'pelanggan123' },
];

export default function Login({ cashierMode = false, mode = 'all' }) {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const tujuanSetelahLogin = (role) => {
    if (role === 'admin') return from?.startsWith('/admin') ? from : '/admin';
    if (role === 'kasir') return from?.startsWith('/kasir') ? from : '/kasir';
    return from && !from.startsWith('/admin') ? from : '/produk';
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(tujuanSetelahLogin(user.role), { replace: true });
    }
  }, [user, from, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      const roleTidakSesuai = (cashierMode && !['admin', 'kasir'].includes(loggedIn.role))
        || (mode === 'admin' && loggedIn.role !== 'admin')
        || (mode === 'pelanggan' && loggedIn.role !== 'pelanggan');
      if (roleTidakSesuai) {
        await logout();
        throw new Error(cashierMode
          ? 'Halaman ini khusus akun kasir. Silakan gunakan akun kasir.'
          : `Akun yang digunakan bukan akun ${mode}.`);
      }
      toast.success(`Selamat datang, ${loggedIn.name}!`);

      navigate(tujuanSetelahLogin(loggedIn.role), { replace: true });
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge={cashierMode ? 'Akses Kasir' : mode === 'admin' ? 'Akses Admin' : 'Masuk Akun'}
      title={cashierMode ? 'Masuk ke meja kasir' : mode === 'admin' ? 'Masuk Admin Toko' : 'Selamat datang kembali'}
      subtitle={cashierMode ? 'Kelola penjualan, pembayaran, dan struk pelanggan.' : mode === 'admin' ? 'Masuk untuk mengelola toko dan memantau penjualan.' : 'Masuk untuk melanjutkan belanja dan memantau pesananmu.'}
      footer={
        <p className="text-center text-sm text-slate-500">
          {cashierMode ? (
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <Link to="/login/admin" className="font-semibold text-brand-700 hover:text-brand-800">Login Admin</Link>
              <span className="text-slate-400">·</span>
              <Link to="/login/pelanggan" className="font-semibold text-brand-700 hover:text-brand-800">Login Pelanggan</Link>
            </span>
          ) : mode === 'admin' ? (
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <Link to="/login/kasir" className="font-semibold text-brand-700 hover:text-brand-800">Login Kasir</Link>
              <span className="text-slate-400">·</span>
              <Link to="/login/pelanggan" className="font-semibold text-brand-700 hover:text-brand-800">Login Pelanggan</Link>
            </span>
          ) : (
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {!['all', 'pelanggan'].includes(mode) && <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Login utama</Link>}
              {mode === 'pelanggan' && <><Link to="/login/admin" className="font-semibold text-brand-700 hover:text-brand-800">Login Admin</Link><span className="text-slate-400">·</span><Link to="/login/kasir" className="font-semibold text-brand-700 hover:text-brand-800">Login Kasir</Link><span className="text-slate-400">·</span></>}
              {mode === 'all' && <><span>Petugas toko?</span><Link to="/login/kasir" className="font-semibold text-brand-700 hover:text-brand-800">Login Kasir</Link><span className="text-slate-400">·</span></>}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">Daftar akun</Link>
            </span>
          )}
        </p>
      }
    >
      <form onSubmit={submit} className="auth-fields space-y-4">
        <div>
          <label className="label">Alamat email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input auth-input pl-11"
              placeholder="nama@email.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input auth-input pl-11 pr-11"
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary auth-submit w-full py-3">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            cashierMode ? 'Buka Kasir' : 'Masuk Sekarang'
          )}
        </button>
      </form>

      <div className="auth-demo mt-6 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Akun demo untuk pengujian
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {akunDemo.filter((akun) => {
            if (cashierMode) return akun.label === 'Kasir';
            if (mode === 'admin') return akun.label === 'Admin';
            if (mode === 'pelanggan') return akun.label === 'Pelanggan';
            return true;
          }).map((akun) => (
            <button
              key={akun.label}
              type="button"
              onClick={() => {
                setEmail(akun.email);
                setPassword(akun.password);
                toast.success(`Kredensial ${akun.label} terisi`);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <UserRound className="h-4 w-4" />
              <span>
                {akun.label}
                <span className="block text-[10px] font-normal text-slate-400">{akun.email}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          {cashierMode ? 'Password demo kasir: kasir123' : mode === 'admin' ? 'Password demo admin: admin123' : mode === 'pelanggan' ? 'Password demo pelanggan: pelanggan123' : 'Password demo: admin123 / kasir123 / pelanggan123'}
        </p>
      </div>
    </AuthShell>
  );
}
