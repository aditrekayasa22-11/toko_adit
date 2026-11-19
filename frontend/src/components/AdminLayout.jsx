import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
  Tags,
  UserCog,
  KeyRound,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/api';
import BrandLogo from './BrandLogo';

const menus = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/kategori', label: 'Data Kategori', icon: Tags },
  { to: '/admin/produk', label: 'Data Produk', icon: Package },
  { to: '/admin/pelanggan', label: 'Data Customer', icon: Users },
  { to: '/admin/transaksi', label: 'Transaksi', icon: ShoppingCart },
  { to: '/admin/pesanan', label: 'Transaksi / Pesanan', icon: ShoppingBag },
  { to: '/admin/laporan', label: 'Laporan Penjualan', icon: BarChart3 },
  { to: '/admin/akun', label: 'Data Admin', icon: UserCog },
  { to: '/admin/ganti-password', label: 'Ganti Password', icon: KeyRound },
];

const titleByPath = {
  '/admin': 'Dashboard',
  '/admin/kategori': 'Data Kategori',
  '/admin/produk': 'Manajemen Produk',
  '/admin/pelanggan': 'Manajemen Pelanggan',
  '/admin/transaksi': 'Manajemen Transaksi',
  '/admin/pesanan': 'Pesanan Online',
  '/admin/laporan': 'Laporan Penjualan',
  '/admin/akun': 'Data Admin',
  '/admin/ganti-password': 'Ganti Password',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const keluar = async () => {
    await logout();
    toast.success('Anda telah keluar');
    navigate('/login');
  };

  const inisial = (user?.name || 'A')
    .split(' ')
    .map((kata) => kata[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="admin-shell min-h-screen bg-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <BrandLogo size="sm" tone="inverted" tagline="Admin Panel" />
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Menu Utama
          </p>
          {menus.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-900/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Store className="h-[18px] w-[18px]" />
            Lihat Toko
          </Link>
          <button
            type="button"
            onClick={keluar}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Keluar
          </button>

          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {inisial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{user?.name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="admin-header sticky top-0 z-20 border-b border-[#d6b66d]/25 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-[#f1e5e7] transition hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-[#fff8ec] sm:text-lg">
                  {titleByPath[location.pathname] || 'Admin Fashion Store'}
                </h1>
                <p className="hidden text-[10px] font-semibold tracking-wide text-[#d8bd83] sm:block">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#e0c47f]/25 bg-white/[.06] py-1.5 pl-2 pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f2dda1]/70 bg-gradient-to-br from-[#d8bb77] via-[#b78d4f] to-[#75502e] text-[10px] font-black text-[#32101f] shadow-sm">
                {inisial}
              </span>
              <span className="hidden text-xs font-bold text-[#fff8ec] sm:block">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-content p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
