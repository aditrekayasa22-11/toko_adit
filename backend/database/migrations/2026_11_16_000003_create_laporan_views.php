<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('CREATE OR REPLACE VIEW view_laporan_transaksi AS
            SELECT t.id_transaksi, p.nama_pelanggan, t.tanggal_transaksi,
                   t.nama_produk, t.jumlah, t.total_harga
            FROM transaksi t
            JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan');

        DB::statement('CREATE OR REPLACE VIEW view_total_belanja AS
            SELECT p.id_pelanggan, p.nama_pelanggan,
                   COUNT(t.id_transaksi) AS jumlah_transaksi,
                   SUM(t.total_harga) AS total_keseluruhan_belanja
            FROM pelanggan p
            LEFT JOIN transaksi t ON p.id_pelanggan = t.id_pelanggan
            GROUP BY p.id_pelanggan, p.nama_pelanggan');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('DROP VIEW IF EXISTS view_laporan_transaksi');
        DB::statement('DROP VIEW IF EXISTS view_total_belanja');
    }
};
