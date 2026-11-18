import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Truck,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';

const navLinks = [
  { to: '/produk', label: 'Katalog', end: true },
  { to: '/produk', label: 'Produk' },
  { to: '/produk?sort=populer', label: 'Terlaris' },
  { to: '/keranjang', label: 'Keranjang' },
];

const inisial = (nama = '') =>
  nama
    .split(' ')
    .map((kata) => kata[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { jumlahItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const keluar = async () => {
    await logout();
    toast.success('Anda telah keluar dari akun');
    navigate('/login', { replace: true });
  };

  return (
    <header className="store-navbar sticky top-0 z-40">
      <div className="store-promo-bar bg-slate-900 text-white">
        <div className="container-page flex items-center justify-center gap-2 py-2 text-[11px] font-medium sm:text-xs">
          <Truck className="h-3.5 w-3.5 text-brand-300" />
          Gratis ongkir untuk belanja minimal Rp300.000 · Pengiriman ke seluruh Indonesia
        </div>
      </div>

      <div className="border-b border-white/80 bg-white/90 shadow-[0_5px_24px_rgba(22,34,58,.045)] backdrop-blur-xl">
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo size="md" />
          </Link>

          {!user && <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>}
          {user && <div className="hidden items-center gap-2 rounded-full border border-brand-100 bg-brand-50/70 px-4 py-2 text-xs font-semibold text-brand-800 lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" />Pilihan fashion untuk setiap harimu</div>}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/produk"
              aria-label="Cari produk"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              to="/keranjang"
              aria-label="Keranjang belanja"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ShoppingCart className="h-5 w-5" />
              {jumlahItem > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {jumlahItem > 99 ? '99+' : jumlahItem}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl p-1 pl-1.5 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                    {inisial(user.name)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-[110px] truncate text-xs font-bold text-slate-800">
                      {user.name}
                    </span>
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {user.role}
                    </span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-soft animate-fade-up">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard Admin
                      </Link>
                    )}
                    {!isAdmin && (
                      <>
                        <Link
                          to="/profil"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <User className="h-4 w-4" /> Profil Saya
                        </Link>
                        <Link
                          to="/pesanan"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Package className="h-4 w-4" /> Pesanan Saya
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={keluar}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="btn-ghost">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Daftar
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Buka menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
              {user && !isAdmin && (
                <Link
                  to="/pesanan"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Pesanan Saya
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Dashboard Admin
                </Link>
              )}
            </div>

            {!user && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link to="/login" className="btn-outline">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
