import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNumber, formatRupiah, productImage } from '../lib/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const habis = product.stok <= 0;

  const tambah = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (habis) return;
    addItem(product, 1);
    toast.success(`${product.nama_produk} masuk keranjang`);
  };

  return (
    <Link
      to={`/produk/${product.id_produk}`}
      className="store-product-card group flex flex-col overflow-hidden rounded-[20px] border border-white bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-50/60">
        <img
          src={productImage(product.gambar)}
          alt={product.nama_produk}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur">
          {product.kategori}
        </span>
        {habis ? (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Stok habis
          </span>
        ) : (
          product.terjual > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {formatNumber(product.terjual)} terjual
            </span>
          )
        )}
        <button
          type="button"
          onClick={tambah}
          disabled={habis}
          aria-label={`Tambah ${product.nama_produk} ke keranjang`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-lg transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-800">{product.nama_produk}</h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <p className="text-base font-extrabold tracking-tight text-brand-700">
            {formatRupiah(product.harga)}
          </p>
          <p className="whitespace-nowrap text-[11px] font-medium text-slate-400">
            Stok {product.stok}
          </p>
        </div>
      </div>
    </Link>
  );
}
