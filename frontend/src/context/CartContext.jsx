import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'tokokita_cart';
const ONGKIR = 20000;
const GRATIS_ONGKIR_MIN = 300000;

const CartContext = createContext(null);

const bacaKeranjang = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(bacaKeranjang);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (produk, jumlah = 1) => {
    setItems((prev) => {
      const ada = prev.find((item) => item.id_produk === produk.id_produk);

      if (ada) {
        return prev.map((item) =>
          item.id_produk === produk.id_produk
            ? {
                ...item,
                jumlah: Math.min(item.jumlah + jumlah, produk.stok ?? item.stok),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id_produk: produk.id_produk,
          nama_produk: produk.nama_produk,
          harga: produk.harga,
          gambar: produk.gambar,
          kategori: produk.kategori,
          stok: produk.stok,
          jumlah: Math.min(jumlah, produk.stok ?? jumlah),
        },
      ];
    });
  };

  const updateJumlah = (idProduk, jumlah) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id_produk === idProduk
          ? {
              ...item,
              jumlah: Math.max(1, Math.min(jumlah, item.stok ?? jumlah)),
            }
          : item
      )
    );
  };

  const removeItem = (idProduk) => {
    setItems((prev) => prev.filter((item) => item.id_produk !== idProduk));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.harga * item.jumlah, 0),
    [items]
  );

  const jumlahItem = useMemo(
    () => items.reduce((total, item) => total + item.jumlah, 0),
    [items]
  );

  const ongkir = subtotal === 0 || subtotal >= GRATIS_ONGKIR_MIN ? 0 : ONGKIR;
  const total = subtotal + ongkir;
  const sisaGratisOngkir = Math.max(0, GRATIS_ONGKIR_MIN - subtotal);

  const value = {
    items,
    addItem,
    updateJumlah,
    removeItem,
    clearCart,
    subtotal,
    jumlahItem,
    ongkir,
    total,
    sisaGratisOngkir,
    gratisOngkirMin: GRATIS_ONGKIR_MIN,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
};
