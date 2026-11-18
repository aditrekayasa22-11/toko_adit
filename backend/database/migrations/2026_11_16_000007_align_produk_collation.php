<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('produk') && Schema::hasTable('transaksi')) {
            DB::statement('ALTER TABLE produk CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
        }

        if (Schema::hasTable('detail_pesanan')) {
            DB::statement('ALTER TABLE detail_pesanan CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('produk')) {
            DB::statement('ALTER TABLE produk CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }

        if (Schema::hasTable('detail_pesanan')) {
            DB::statement('ALTER TABLE detail_pesanan CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        }
    }
};
