import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokokita_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tokokita_token');
      window.dispatchEvent(new Event('tokokita-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID').format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return '-';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const apiError = (error) => {
  if (error.response?.data?.errors) {
    const first = Object.values(error.response.data.errors)[0];
    if (Array.isArray(first) && first.length) return first[0];
  }
  return (
    error.response?.data?.message ||
    error.message ||
    'Terjadi kesalahan. Silakan coba lagi.'
  );
};

export const productImage = (gambar) => {
  if (!gambar) return '/produk/atasan.svg';
  if (/^(https?:)?\/\//i.test(gambar) || gambar.startsWith('/storage/')) return gambar;
  if (gambar.startsWith('produk/')) {
    const apiOrigin = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    return `${apiOrigin}/storage/${gambar}`;
  }
  return `/produk/${gambar}`;
};

export const metodePembayaran = {
  transfer_bank: 'Transfer Bank',
  cod: 'Bayar di Tempat (COD)',
  qris: 'QRIS',
  ewallet: 'E-Wallet',
};

export const gambarProduk = [
  { value: 'atasan.svg', label: 'Atasan' },
  { value: 'bawahan.svg', label: 'Bawahan' },
  { value: 'sepatu.svg', label: 'Sepatu' },
  { value: 'tas.svg', label: 'Tas' },
  { value: 'aksesoris.svg', label: 'Aksesoris' },
  { value: 'parfum.svg', label: 'Perawatan' },
];

export const kategoriProduk = [
  'Atasan',
  'Bawahan',
  'Sepatu',
  'Tas',
  'Aksesoris',
  'Perawatan',
];

export default api;
