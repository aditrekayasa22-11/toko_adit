import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import StoreLayout from './components/StoreLayout';
import AdminLayout from './components/AdminLayout';
import { FullPageLoader } from './components/Spinner';
import { AdminRoute, CashierRoute, ProtectedRoute } from './components/RouteGuards';

const Home = lazy(() => import('./pages/Home'));
const Produk = lazy(() => import('./pages/Produk'));
const ProdukDetail = lazy(() => import('./pages/ProdukDetail'));
const Keranjang = lazy(() => import('./pages/Keranjang'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PesananSaya = lazy(() => import('./pages/PesananSaya'));
const PesananDetail = lazy(() => import('./pages/PesananDetail'));
const Profil = lazy(() => import('./pages/Profil'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProduk = lazy(() => import('./pages/admin/AdminProduk'));
const AdminPelanggan = lazy(() => import('./pages/admin/AdminPelanggan'));
const AdminTransaksi = lazy(() => import('./pages/admin/AdminTransaksi'));
const AdminPesanan = lazy(() => import('./pages/admin/AdminPesanan'));
const AdminLaporan = lazy(() => import('./pages/admin/AdminLaporan'));
const AdminKategori = lazy(() => import('./pages/admin/AdminKategori'));
const AdminAkun = lazy(() => import('./pages/admin/AdminAkun'));
const GantiPassword = lazy(() => import('./pages/admin/GantiPassword'));
const KasirPOS = lazy(() => import('./pages/kasir/KasirPOS'));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<Login mode="admin" />} />
          <Route path="/login/pelanggan" element={<Login mode="pelanggan" />} />
          <Route path="/login/kasir" element={<Login cashierMode />} />
          <Route path="/register" element={<Register />} />
          <Route element={<CashierRoute />}>
            <Route path="/kasir" element={<KasirPOS />} />
          </Route>
          <Route element={<StoreLayout />}>
            <Route index element={<Navigate to="/produk" replace />} />
            <Route path="produk" element={<Produk />} />
            <Route path="produk/:id" element={<ProdukDetail />} />
            <Route path="keranjang" element={<Keranjang />} />

            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="pesanan" element={<PesananSaya />} />
              <Route path="pesanan/:id" element={<PesananDetail />} />
              <Route path="profil" element={<Profil />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="kategori" element={<AdminKategori />} />
              <Route path="produk" element={<AdminProduk />} />
              <Route path="pelanggan" element={<AdminPelanggan />} />
              <Route path="transaksi" element={<AdminTransaksi />} />
              <Route path="pesanan" element={<AdminPesanan />} />
              <Route path="laporan" element={<AdminLaporan />} />
              <Route path="akun" element={<AdminAkun />} />
              <Route path="ganti-password" element={<GantiPassword />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
