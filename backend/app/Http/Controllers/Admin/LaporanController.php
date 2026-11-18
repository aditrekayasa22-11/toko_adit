<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    public function transaksi(Request $request): JsonResponse
    {
        $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
        ]);

        $query = $this->queryTransaksi($request);

        $summary = (clone $query)
            ->selectRaw('COUNT(*) as jumlah_transaksi, COALESCE(SUM(total_harga), 0) as total_pendapatan, COALESCE(SUM(jumlah), 0) as total_item')
            ->first();

        $paginator = $query
            ->orderByDesc('tanggal_transaksi')
            ->orderByDesc('id_transaksi')
            ->paginate(15)
            ->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($item) => [
                'id_transaksi' => (int) $item->id_transaksi,
                'nama_pelanggan' => $item->nama_pelanggan,
                'tanggal_transaksi' => $item->tanggal_transaksi,
                'nama_produk' => $item->nama_produk,
                'jumlah' => (int) $item->jumlah,
                'total_harga' => (float) $item->total_harga,
            ])->values(),
            'ringkasan' => [
                'jumlah_transaksi' => (int) $summary->jumlah_transaksi,
                'total_pendapatan' => (float) $summary->total_pendapatan,
                'total_item' => (int) $summary->total_item,
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function totalBelanja(Request $request): JsonResponse
    {
        $query = DB::table('view_total_belanja');

        if ($search = trim((string) $request->query('search'))) {
            $query->where('nama_pelanggan', 'like', "%{$search}%");
        }

        $rows = $query
            ->orderByRaw('total_keseluruhan_belanja IS NULL')
            ->orderByDesc('total_keseluruhan_belanja')
            ->get();

        $data = $rows->map(fn ($item) => [
            'id_pelanggan' => (int) $item->id_pelanggan,
            'nama_pelanggan' => $item->nama_pelanggan,
            'jumlah_transaksi' => (int) $item->jumlah_transaksi,
            'total_keseluruhan_belanja' => (float) ($item->total_keseluruhan_belanja ?? 0),
        ]);

        return response()->json([
            'data' => $data,
            'ringkasan' => [
                'total_pelanggan' => $data->count(),
                'total_transaksi' => (int) $data->sum('jumlah_transaksi'),
                'total_belanja' => (float) $data->sum('total_keseluruhan_belanja'),
            ],
        ]);
    }

    public function exportTransaksi(Request $request)
    {
        $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
        ]);

        $query = $this->queryTransaksi($request)
            ->orderBy('tanggal_transaksi')
            ->orderBy('id_transaksi');

        $filename = 'laporan-transaksi-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['No', 'ID Transaksi', 'Nama Pelanggan', 'Tanggal', 'Nama Produk', 'Jumlah', 'Total Harga']);

            $no = 1;
            $grandTotal = 0;

            foreach ($query->cursor() as $row) {
                $grandTotal += (float) $row->total_harga;
                fputcsv($output, [
                    $no++,
                    $row->id_transaksi,
                    $row->nama_pelanggan,
                    $row->tanggal_transaksi,
                    $row->nama_produk,
                    $row->jumlah,
                    $row->total_harga,
                ]);
            }

            fputcsv($output, ['', '', '', '', 'TOTAL', '', $grandTotal]);
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function queryTransaksi(Request $request)
    {
        return DB::table('view_laporan_transaksi')
            ->when($request->query('dari'), fn ($q, $dari) => $q->whereDate('tanggal_transaksi', '>=', $dari))
            ->when($request->query('sampai'), fn ($q, $sampai) => $q->whereDate('tanggal_transaksi', '<=', $sampai))
            ->when(trim((string) $request->query('nama')), function ($q) use ($request) {
                $q->where('nama_pelanggan', 'like', '%'.trim((string) $request->query('nama')).'%');
            });
    }
}
