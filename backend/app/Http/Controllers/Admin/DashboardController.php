<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        $mulai = now()->subDays(13)->startOfDay();
        $penjualan = Transaksi::query()
            ->selectRaw('tanggal_transaksi, SUM(total_harga) as total')
            ->whereDate('tanggal_transaksi', '>=', $mulai->toDateString())
            ->groupBy('tanggal_transaksi')
            ->pluck('total', 'tanggal_transaksi');

        $grafik = [];
        for ($i = 13; $i >= 0; $i--) {
            $tanggal = now()->subDays($i);
            $kunci = $tanggal->toDateString();
            $grafik[] = [
                'tanggal' => $kunci,
                'label' => $tanggal->format('d').' '.$bulan[(int) $tanggal->format('n') - 1],
                'total' => (float) ($penjualan[$kunci] ?? 0),
            ];
        }

        $produkTerlaris = Transaksi::query()
            ->select('nama_produk', DB::raw('SUM(jumlah) as terjual'), DB::raw('SUM(total_harga) as total'))
            ->groupBy('nama_produk')
            ->orderByDesc('terjual')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'nama_produk' => $item->nama_produk,
                'terjual' => (int) $item->terjual,
                'total' => (float) $item->total,
            ]);

        $transaksiTerbaru = DB::table('view_laporan_transaksi')
            ->orderByDesc('tanggal_transaksi')
            ->orderByDesc('id_transaksi')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id_transaksi' => (int) $item->id_transaksi,
                'nama_pelanggan' => $item->nama_pelanggan,
                'tanggal_transaksi' => $item->tanggal_transaksi,
                'nama_produk' => $item->nama_produk,
                'jumlah' => (int) $item->jumlah,
                'total_harga' => (float) $item->total_harga,
            ]);

        $pesananTerbaru = Pesanan::with('pelanggan')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Pesanan $pesanan) => [
                'id_pesanan' => $pesanan->id_pesanan,
                'kode_pesanan' => $pesanan->kode_pesanan,
                'nama_pelanggan' => $pesanan->pelanggan?->nama_pelanggan,
                'tanggal_pesanan' => optional($pesanan->tanggal_pesanan)->format('Y-m-d'),
                'total_harga' => (float) $pesanan->total_harga,
                'status' => $pesanan->status,
            ]);

        return response()->json([
            'total_pelanggan' => Pelanggan::count(),
            'total_produk' => Produk::count(),
            'total_transaksi' => Transaksi::count(),
            'total_omzet' => (float) Transaksi::sum('total_harga'),
            'pesanan_pending' => Pesanan::where('status', 'pending')->count(),
            'pesanan_total' => Pesanan::count(),
            'grafik_penjualan' => $grafik,
            'produk_terlaris' => $produkTerlaris,
            'transaksi_terbaru' => $transaksiTerbaru,
            'pesanan_terbaru' => $pesananTerbaru,
            'stok_menipis' => Produk::where('stok', '<=', 10)
                ->orderBy('stok')
                ->limit(5)
                ->get()
                ->map(fn (Produk $produk) => $produk->toApiArray()),
        ]);
    }
}
