<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AkunController as AdminAkunController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\PelangganController as AdminPelangganController;
use App\Http\Controllers\Admin\PesananController as AdminPesananController;
use App\Http\Controllers\Admin\ProdukController as AdminProdukController;
use App\Http\Controllers\Admin\TransaksiController as AdminTransaksiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KatalogController;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\PembayaranController;
use Illuminate\Support\Facades\Route;

Route::get('/produk', [KatalogController::class, 'index']);
Route::get('/produk/{produk}', [KatalogController::class, 'show']);
Route::get('/kategori', [KatalogController::class, 'kategori']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/pembayaran/duitku/callback', [PembayaranController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/profil', [AuthController::class, 'updateProfile']);

    Route::get('/statistik-saya', [PesananController::class, 'statistikSaya']);
    Route::get('/pesanan-saya', [PesananController::class, 'index']);
    Route::post('/pesanan', [PesananController::class, 'store']);
    Route::post('/pesanan-saya/{pesanan}/pembayaran', [PembayaranController::class, 'buatInvoice']);
    Route::post('/pesanan-saya/{pesanan}/verifikasi-pembayaran', [PembayaranController::class, 'verifikasi'])
        ->middleware('throttle:3,1');
    Route::get('/pesanan-saya/{pesanan}', [PesananController::class, 'show']);
    Route::post('/pesanan-saya/{pesanan}/batal', [PesananController::class, 'batalkan']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/akun', [AdminAkunController::class, 'index']);

    Route::get('/pelanggan-options', [AdminPelangganController::class, 'options']);
    Route::apiResource('/pelanggan', AdminPelangganController::class);

    Route::get('/produk', [AdminProdukController::class, 'index']);
    Route::post('/produk', [AdminProdukController::class, 'store']);
    Route::get('/produk/{produk}', [AdminProdukController::class, 'show']);
    Route::put('/produk/{produk}', [AdminProdukController::class, 'update']);
    Route::delete('/produk/{produk}', [AdminProdukController::class, 'destroy']);

    Route::get('/transaksi-options', [AdminTransaksiController::class, 'options']);
    Route::apiResource('/transaksi', AdminTransaksiController::class);

    Route::get('/pesanan', [AdminPesananController::class, 'index']);
    Route::get('/pesanan/{pesanan}', [AdminPesananController::class, 'show']);
    Route::put('/pesanan/{pesanan}/status', [AdminPesananController::class, 'updateStatus']);

    Route::get('/laporan/transaksi', [LaporanController::class, 'transaksi']);
    Route::get('/laporan/transaksi/export', [LaporanController::class, 'exportTransaksi']);
    Route::get('/laporan/total-belanja', [LaporanController::class, 'totalBelanja']);
});

Route::middleware(['auth:sanctum', 'cashier'])->prefix('kasir')->group(function () {
    Route::get('/akun', [KasirController::class, 'accounts']);
    Route::get('/options', [KasirController::class, 'options']);
    Route::get('/ringkasan', [KasirController::class, 'summary']);
    Route::get('/riwayat', [KasirController::class, 'history']);
    Route::get('/transaksi', [KasirController::class, 'history']);
    Route::get('/pelanggan', [KasirController::class, 'customers']);
    Route::post('/pelanggan', [KasirController::class, 'storeCustomer']);
    Route::put('/pelanggan/{pelanggan}', [KasirController::class, 'updateCustomer']);
    Route::post('/transaksi', [KasirController::class, 'checkout']);
});
