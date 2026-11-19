<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pesanan', function (Blueprint $table) {
            $table->string('status_pembayaran', 20)->default('menunggu')->after('status');
            $table->string('duitku_reference', 64)->nullable()->after('status_pembayaran')->index();
            $table->text('duitku_payment_url')->nullable()->after('duitku_reference');
        });
    }

    public function down(): void
    {
        Schema::table('pesanan', function (Blueprint $table) {
            $table->dropIndex(['duitku_reference']);
            $table->dropColumn(['status_pembayaran', 'duitku_reference', 'duitku_payment_url']);
        });
    }
};
