<?php

namespace Database\Seeders;

use App\Models\Produk;
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    public function run(): void
    {
        $produk = [
            ['Kemeja Flanel', 'Atasan', 125000, 32, 'Kemeja flanel motif kotak-kotak dengan bahan katun lembut dan nyaman dipakai harian.', 'atasan.svg'],
            ['Kaos Polos', 'Atasan', 45000, 80, 'Kaos polos premium bahan cotton combed 30s, adem dan tidak mudah melar.', 'atasan.svg'],
            ['Kemeja Batik', 'Atasan', 200000, 25, 'Kemeja batik tulis dengan motif klasik, cocok untuk acara formal maupun santai.', 'atasan.svg'],
            ['Jaket Bomber', 'Atasan', 300000, 18, 'Jaket bomber anti angin dengan lapisan dalam lembut, gaya kasual modern.', 'atasan.svg'],
            ['Jaket Denim', 'Atasan', 280000, 15, 'Jaket denim klasik dengan potongan modern, tahan lama dan mudah dipadukan.', 'atasan.svg'],
            ['Celana Jeans', 'Bawahan', 180000, 28, 'Celana jeans slim fit dengan bahan stretch, nyaman untuk aktivitas sehari-hari.', 'bawahan.svg'],
            ['Celana Chino', 'Bawahan', 175000, 22, 'Celana chino bahan twill premium, potongan slim dan rapi untuk segala acara.', 'bawahan.svg'],
            ['Sepatu Sneakers', 'Sepatu', 450000, 20, 'Sepatu sneakers bergaya sporty dengan sol empuk untuk kenyamanan maksimal.', 'sepatu.svg'],
            ['Sepatu Formal', 'Sepatu', 350000, 14, 'Sepatu formal kulit sintetis premium, elegan untuk acara resmi dan kantor.', 'sepatu.svg'],
            ['Sandal Casual', 'Sepatu', 70000, 40, 'Sandal casual ringan dengan alas anti slip, cocok untuk santai dan jalan-jalan.', 'sepatu.svg'],
            ['Tas Ransel', 'Tas', 220000, 17, 'Tas ransel kapasitas besar dengan kompartemen laptop dan bahan anti air.', 'tas.svg'],
            ['Tas Selempang', 'Tas', 160000, 26, 'Tas selempang minimalis dengan tali adjustable, praktis untuk kegiatan harian.', 'tas.svg'],
            ['Topi Baseball', 'Aksesoris', 35000, 50, 'Topi baseball unisex bahan katun, desain simpel dan mudah dipadukan.', 'aksesoris.svg'],
            ['Dompet Kulit', 'Aksesoris', 95000, 30, 'Dompet kulit asli dengan banyak slot kartu dan ruang uang, awet dan elegan.', 'aksesoris.svg'],
            ['Jam Tangan', 'Aksesoris', 550000, 9, 'Jam tangan analog dengan tali kulit, tampilan klasik untuk pria dan wanita.', 'aksesoris.svg'],
            ['Sabuk Kulit', 'Aksesoris', 60000, 35, 'Sabuk kulit premium dengan buckle metalik, kuat dan tahan lama.', 'aksesoris.svg'],
            ['Kacamata Hitam', 'Aksesoris', 125000, 12, 'Kacamata hitam dengan lensa UV400, gaya modern dan melindungi mata.', 'aksesoris.svg'],
            ['Parfum', 'Perawatan', 250000, 16, 'Parfum unisex aroma tahan lama, kemasan elegan cocok untuk hadiah.', 'parfum.svg'],
        ];

        foreach ($produk as [$nama, $kategori, $harga, $stok, $deskripsi, $gambar]) {
            Produk::updateOrCreate(
                ['nama_produk' => $nama],
                [
                    'kategori' => $kategori,
                    'harga' => $harga,
                    'stok' => $stok,
                    'deskripsi' => $deskripsi,
                    'gambar' => $gambar,
                ]
            );
        }
    }
}
