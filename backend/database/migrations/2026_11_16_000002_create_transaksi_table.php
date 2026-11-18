<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('transaksi')) {
            return;
        }

        Schema::create('transaksi', function (Blueprint $table) {
            $table->integer('id_transaksi', true);
            $table->integer('id_pelanggan');
            $table->date('tanggal_transaksi');
            $table->string('nama_produk', 100);
            $table->integer('jumlah');
            $table->decimal('total_harga', 12, 2);

            $table->foreign('id_pelanggan')
                ->references('id_pelanggan')
                ->on('pelanggan')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
