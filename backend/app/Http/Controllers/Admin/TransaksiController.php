<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('transaksi as t')
            ->join('pelanggan as p', 't.id_pelanggan', '=', 'p.id_pelanggan')
            ->select(
                't.id_transaksi',
                't.id_pelanggan',
                'p.nama_pelanggan',
                't.tanggal_transaksi',
                't.nama_produk',
                't.jumlah',
                't.total_harga'
            );

        $ringkasan = DB::table('transaksi as t')
            ->join('pelanggan as p', 't.id_pelanggan', '=', 'p.id_pelanggan')
            ->selectRaw('COUNT(*) as jumlah_transaksi, COALESCE(SUM(t.total_harga), 0) as total_pendapatan, COALESCE(SUM(t.jumlah), 0) as total_item');

        $this->terapkanFilter($query, $request);
        $this->terapkanFilter($ringkasan, $request);

        $summary = $ringkasan->first();

        $paginator = $query
            ->orderByDesc('t.tanggal_transaksi')
            ->orderByDesc('t.id_transaksi')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($item) => [
                'id_transaksi' => (int) $item->id_transaksi,
                'id_pelanggan' => (int) $item->id_pelanggan,
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

    public function options(): JsonResponse
    {
        return response()->json([
            'pelanggan' => Pelanggan::orderBy('nama_pelanggan')
                ->get(['id_pelanggan', 'nama_pelanggan'])
                ->map(fn (Pelanggan $pelanggan) => $pelanggan->toApiArray()),
            'produk' => Produk::orderBy('nama_produk')
                ->get()
                ->map(fn (Produk $produk) => $produk->toApiArray()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $transaksi = Transaksi::create($this->validasi($request));

        return response()->json([
            'message' => 'Transaksi berhasil ditambahkan.',
            'data' => $this->payload($transaksi),
        ], 201);
    }

    public function show(Transaksi $transaksi): JsonResponse
    {
        return response()->json(['data' => $this->payload($transaksi)]);
    }

    public function update(Request $request, Transaksi $transaksi): JsonResponse
    {
        $transaksi->update($this->validasi($request));

        return response()->json([
            'message' => 'Transaksi berhasil diperbarui.',
            'data' => $this->payload($transaksi->fresh()),
        ]);
    }

    public function destroy(Transaksi $transaksi): JsonResponse
    {
        $transaksi->delete();

        return response()->json(['message' => 'Transaksi berhasil dihapus.']);
    }

    private function validasi(Request $request): array
    {
        return $request->validate([
            'id_pelanggan' => ['required', 'integer', 'exists:pelanggan,id_pelanggan'],
            'tanggal_transaksi' => ['required', 'date'],
            'nama_produk' => ['required', 'string', 'max:100'],
            'jumlah' => ['required', 'integer', 'min:1'],
            'total_harga' => ['required', 'numeric', 'min:0'],
        ]);
    }

    private function payload(Transaksi $transaksi): array
    {
        $transaksi->loadMissing('pelanggan');

        return [
            'id_transaksi' => $transaksi->id_transaksi,
            'id_pelanggan' => $transaksi->id_pelanggan,
            'nama_pelanggan' => $transaksi->pelanggan?->nama_pelanggan,
            'tanggal_transaksi' => optional($transaksi->tanggal_transaksi)->format('Y-m-d'),
            'nama_produk' => $transaksi->nama_produk,
            'jumlah' => (int) $transaksi->jumlah,
            'total_harga' => (float) $transaksi->total_harga,
        ];
    }

    private function terapkanFilter($query, Request $request): void
    {
        if ($dari = $request->query('dari')) {
            $query->whereDate('t.tanggal_transaksi', '>=', $dari);
        }

        if ($sampai = $request->query('sampai')) {
            $query->whereDate('t.tanggal_transaksi', '<=', $sampai);
        }

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('p.nama_pelanggan', 'like', "%{$search}%")
                    ->orWhere('t.nama_produk', 'like', "%{$search}%");
            });
        }
    }
}
