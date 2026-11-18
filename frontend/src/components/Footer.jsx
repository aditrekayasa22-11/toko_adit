import { Link } from 'react-router-dom';
import {
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <BrandLogo size="md" tone="inverted" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Toko online terpercaya untuk kebutuhan fashion, sepatu, tas, dan aksesoris.
            Produk original dengan kualitas terbaik dan harga bersahabat.
          </p>
          <div className="mt-5 flex gap-2">
            {[Globe, MessageCircle, Share2].map((Icon, index) => (
              <span
                key={index}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-brand-600 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Belanja</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/" className="transition hover:text-brand-400">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/produk" className="transition hover:text-brand-400">
                Semua Produk
              </Link>
            </li>
            <li>
              <Link to="/produk?sort=populer" className="transition hover:text-brand-400">
                Produk Terlaris
              </Link>
            </li>
            <li>
              <Link to="/keranjang" className="transition hover:text-brand-400">
                Keranjang Belanja
              </Link>
            </li>
            <li>
              <Link to="/pesanan" className="transition hover:text-brand-400">
                Pesanan Saya
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Bantuan</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="transition hover:text-brand-400">Panduan Belanja</li>
            <li className="transition hover:text-brand-400">Metode Pembayaran</li>
            <li className="transition hover:text-brand-400">Pengiriman & Ongkir</li>
            <li className="transition hover:text-brand-400">Pengembalian Barang</li>
            <li className="transition hover:text-brand-400">Hubungi Customer Service</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Kontak Kami</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span>Jl. Merdeka No. 10, Ponorogo, Jawa Timur 63411</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-400" />
              <span>0812-3456-7891</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brand-400" />
              <span>halo@tokokita.id</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-brand-400" />
              <span>Senin - Sabtu, 08.00 - 20.00 WIB</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Toko Adit. Semua hak cipta dilindungi.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-white/5 px-2 py-1 font-semibold text-slate-300">BCA</span>
            <span className="rounded-md bg-white/5 px-2 py-1 font-semibold text-slate-300">QRIS</span>
            <span className="rounded-md bg-white/5 px-2 py-1 font-semibold text-slate-300">COD</span>
            <span className="rounded-md bg-white/5 px-2 py-1 font-semibold text-slate-300">E-Wallet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
