<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id('id_pesanan');
            $table->string('kode_pesanan', 30)->unique();
            $table->integer('id_pelanggan');
            $table->date('tanggal_pesanan');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('ongkir', 12, 2)->default(0);
            $table->decimal('total_harga', 12, 2);
            $table->enum('status', ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'])
                ->default('pending');
            $table->string('metode_pembayaran', 30)->default('transfer_bank');
            $table->text('alamat_pengiriman');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('id_pelanggan')
                ->references('id_pelanggan')
                ->on('pelanggan')
                ->cascadeOnDelete();
        });

        Schema::create('detail_pesanan', function (Blueprint $table) {
            $table->id('id_detail');
            $table->unsignedBigInteger('id_pesanan');
            $table->unsignedInteger('id_produk')->nullable();
            $table->string('nama_produk', 100);
            $table->decimal('harga', 12, 2);
            $table->integer('jumlah');
            $table->decimal('subtotal', 12, 2);

            $table->foreign('id_pesanan')
                ->references('id_pesanan')
                ->on('pesanan')
                ->cascadeOnDelete();

            $table->foreign('id_produk')
                ->references('id_produk')
                ->on('produk')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_pesanan');
        Schema::dropIfExists('pesanan');
    }
};
