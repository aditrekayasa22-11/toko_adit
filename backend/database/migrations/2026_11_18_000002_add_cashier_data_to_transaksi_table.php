<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->string('kode_transaksi', 32)->nullable()->index()->after('id_pelanggan');
            $table->foreignId('id_kasir')->nullable()->constrained('users')->nullOnDelete()->after('kode_transaksi');
            $table->string('metode_pembayaran', 20)->nullable()->after('total_harga');
            $table->decimal('jumlah_bayar', 12, 2)->nullable()->after('metode_pembayaran');
            $table->decimal('kembalian', 12, 2)->nullable()->after('jumlah_bayar');
        });
    }

    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['id_kasir']);
            $table->dropIndex(['kode_transaksi']);
            $table->dropColumn(['kode_transaksi', 'id_kasir', 'metode_pembayaran', 'jumlah_bayar', 'kembalian']);
        });
    }
};
