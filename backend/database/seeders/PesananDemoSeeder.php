<?php

namespace Database\Seeders;

use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PesananDemoSeeder extends Seeder
{
    public function run(): void
    {
        $demo = [
            [
                'kode_pesanan' => 'INV-DEMO-0001',
                'email_pelanggan' => 'budi.santoso@tokokita.id',
                'tanggal_pesanan' => now()->subDays(2)->toDateString(),
                'status' => 'pending',
                'metode_pembayaran' => 'transfer_bank',
                'alamat_pengiriman' => 'Jl. Merdeka No. 10, Ponorogo',
                'catatan' => 'Mohon dikemas rapi ya.',
                'items' => [
                    ['nama_produk' => 'Kemeja Flanel', 'jumlah' => 1],
                    ['nama_produk' => 'Topi Baseball', 'jumlah' => 1],
                ],
            ],
            [
                'kode_pesanan' => 'INV-DEMO-0002',
                'email_pelanggan' => 'dewi.lestari@tokokita.id',
                'tanggal_pesanan' => now()->subDay()->toDateString(),
                'status' => 'diproses',
                'metode_pembayaran' => 'cod',
                'alamat_pengiriman' => 'Jl. Diponegoro No. 8, Ponorogo',
                'catatan' => null,
                'items' => [
                    ['nama_produk' => 'Sepatu Formal', 'jumlah' => 1],
                ],
            ],
            [
                'kode_pesanan' => 'INV-DEMO-0003',
                'email_pelanggan' => 'siti.aminah@tokokita.id',
                'tanggal_pesanan' => now()->toDateString(),
                'status' => 'dikirim',
                'metode_pembayaran' => 'qris',
                'alamat_pengiriman' => 'Jl. A. Yani No. 15, Ponorogo',
                'catatan' => 'Titip di pos keamanan.',
                'items' => [
                    ['nama_produk' => 'Kaos Polos', 'jumlah' => 2],
                    ['nama_produk' => 'Sabuk Kulit', 'jumlah' => 1],
                ],
            ],
        ];

        foreach ($demo as $data) {
            if (Pesanan::where('kode_pesanan', $data['kode_pesanan'])->exists()) {
                continue;
            }

            $user = User::where('email', $data['email_pelanggan'])->first();
            if (! $user || ! $user->id_pelanggan) {
                continue;
            }

            DB::transaction(function () use ($data, $user) {
                $detail = [];
                $subtotal = 0;

                foreach ($data['items'] as $item) {
                    $produk = Produk::where('nama_produk', $item['nama_produk'])->firstOrFail();
                    $jumlah = min($item['jumlah'], $produk->stok);
                    if ($jumlah < 1) {
                        continue;
                    }
                    $itemSubtotal = $produk->harga * $jumlah;
                    $subtotal += $itemSubtotal;
                    $detail[] = [
                        'id_produk' => $produk->id_produk,
                        'nama_produk' => $produk->nama_produk,
                        'harga' => $produk->harga,
                        'jumlah' => $jumlah,
                        'subtotal' => $itemSubtotal,
                    ];
                    $produk->decrement('stok', $jumlah);
                }

                if (count($detail) === 0) {
                    return;
                }

                $ongkir = $subtotal >= 300000 ? 0 : 20000;

                $pesanan = Pesanan::create([
                    'kode_pesanan' => $data['kode_pesanan'],
                    'id_pelanggan' => $user->id_pelanggan,
                    'tanggal_pesanan' => $data['tanggal_pesanan'],
                    'subtotal' => $subtotal,
                    'ongkir' => $ongkir,
                    'total_harga' => $subtotal + $ongkir,
                    'status' => $data['status'],
                    'metode_pembayaran' => $data['metode_pembayaran'],
                    'alamat_pengiriman' => $data['alamat_pengiriman'],
                    'catatan' => $data['catatan'],
                ]);

                $pesanan->details()->createMany($detail);
            });
        }
    }
}
