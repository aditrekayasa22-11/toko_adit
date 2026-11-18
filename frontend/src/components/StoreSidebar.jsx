import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Backpack,
  ClipboardList,
  Footprints,
  Layers,
  LayoutDashboard,
  Package,
  Shirt,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  User,
  Wallet,
  Watch,
  X,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';

const kategoriIkon = {
  Atasan: Shirt,
  Bawahan: Layers,
  Sepatu: Footprints,
  Tas: Backpack,
  Aksesoris: Watch,
  Perawatan: Sparkles,
};

const menuUtama = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/produk', label: 'Produk', icon: Package },
  { to: '/produk?sort=populer', label: 'Terlaris', icon: TrendingUp },
  { to: '/keranjang', label: 'Keranjang', icon: ShoppingCart, cart: true },
  { to: '/pesanan', label: 'Pesanan Saya', icon: ClipboardList, auth: true },
  { to: '/profil', label: 'Profil Saya', icon: User, auth: true },
];

function NavItem({ to, label, icon: Icon, active, badge, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
        active
          ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-950/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            active ? 'bg-white/20 text-white' : 'bg-brand-600 text-white'
          }`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function StoreSidebar({ open, onClose }) {
  const { user, isAdmin } = useAuth();
  const { jumlahItem } = useCart();
  const location = useLocation();
  const [kategori, setKategori] = useState([]);

  useEffect(() => {
    let aktif = true;
    api
      .get('/kategori')
      .then(({ data }) => aktif && setKategori(data.data || []))
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, []);

  const params = new URLSearchParams(location.search);
  const kategoriAktif = params.get('kategori');
  const sortAktif = params.get('sort');
  const diProduk = location.pathname === '/produk';

  const adalah = (to) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/produk') return diProduk && !kategoriAktif && !sortAktif;
    if (to === '/produk?sort=populer') return diProduk && sortAktif === 'populer';
    if (to === '/keranjang') return location.pathname.startsWith('/keranjang');
    if (to === '/pesanan') return location.pathname.startsWith('/pesanan');
    if (to === '/profil') return location.pathname === '/profil';
    return location.pathname === to;
  };

  const menuTampil = menuUtama.filter((item) => !item.auth || user);
  const totalKategori = kategori.reduce((total, item) => total + item.jumlah, 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`store-sidebar fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col bg-gradient-to-b from-[#3b1428] via-[#29101e] to-[#170a14] text-slate-300 transition-transform duration-300 lg:sticky lg:inset-y-auto lg:top-[101px] lg:z-20 lg:h-[calc(100vh-101px)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <BrandLogo size="sm" tone="inverted" tagline="Belanja Mudah & Aman" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Menu Utama
            </p>
            {menuTampil.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={adalah(item.to)}
                badge={item.cart ? jumlahItem : undefined}
                onClick={onClose}
              />
            ))}
            {isAdmin && (
              <NavItem
                to="/admin"
                label="Dashboard Admin"
                icon={Wallet}
                active={location.pathname.startsWith('/admin')}
                onClick={onClose}
              />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Kategori
              </p>
              <Link
                to="/produk"
                onClick={onClose}
                className="text-[10px] font-semibold text-slate-500 transition hover:text-brand-300"
              >
                {totalKategori} item
              </Link>
            </div>

            <NavItem
              to="/produk"
              label="Semua Kategori"
              icon={Layers}
              active={diProduk && !kategoriAktif && !sortAktif}
              onClick={onClose}
            />

            {kategori.map((item) => {
              const Icon = kategoriIkon[item.kategori] || Sparkles;
              return (
                <Link
                  key={item.kategori}
                  to={`/produk?kategori=${encodeURIComponent(item.kategori)}`}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                    diProduk && kategoriAktif === item.kategori
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-950/40'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{item.kategori}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      diProduk && kategoriAktif === item.kategori
                        ? 'text-brand-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.jumlah}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/5 p-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-[#50152f] p-4 text-white">
            <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-10 -left-6 h-20 w-20 rounded-full bg-white/10" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Truck className="h-4 w-4" />
            </span>
            <p className="relative mt-3 text-sm font-bold">Gratis Ongkir</p>
            <p className="relative mt-1 text-[11px] leading-relaxed text-brand-100">
              Belanja minimal Rp300.000 ke seluruh Indonesia.
            </p>
            <Link
              to="/produk"
              onClick={onClose}
              className="relative mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
            >
              Belanja Sekarang <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
