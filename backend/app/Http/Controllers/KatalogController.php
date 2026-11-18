<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 12), 1), 48);

        $query = Produk::query()
            ->select('produk.*')
            ->selectSub(function ($sub) {
                $sub->from('transaksi')
                    ->selectRaw('COALESCE(SUM(transaksi.jumlah), 0)')
                    ->whereColumn('transaksi.nama_produk', 'produk.nama_produk');
            }, 'terjual');

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('produk.nama_produk', 'like', "%{$search}%")
                    ->orWhere('produk.kategori', 'like', "%{$search}%");
            });
        }

        $kategori = $request->query('kategori');
        if ($kategori && $kategori !== 'Semua') {
            $query->where('produk.kategori', $kategori);
        }

        match ($request->query('sort')) {
            'termurah' => $query->orderBy('produk.harga'),
            'termahal' => $query->orderByDesc('produk.harga'),
            'populer' => $query->orderByDesc('terjual'),
            'terbaru' => $query->orderByDesc('produk.created_at'),
            default => $query->orderBy('produk.nama_produk'),
        };

        $paginator = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())
                ->map(fn (Produk $produk) => $produk->toApiArray())
                ->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(Produk $produk): JsonResponse
    {
        $terjual = DB::table('transaksi')
            ->where('nama_produk', $produk->nama_produk)
            ->sum('jumlah');

        $produk->setAttribute('terjual', (int) $terjual);

        $terkait = Produk::query()
            ->where('kategori', $produk->kategori)
            ->where('id_produk', '!=', $produk->id_produk)
            ->select('produk.*')
            ->selectSub(function ($sub) {
                $sub->from('transaksi')
                    ->selectRaw('COALESCE(SUM(transaksi.jumlah), 0)')
                    ->whereColumn('transaksi.nama_produk', 'produk.nama_produk');
            }, 'terjual')
            ->limit(4)
            ->get()
            ->map(fn (Produk $item) => $item->toApiArray());

        return response()->json([
            'data' => $produk->toApiArray(),
            'terkait' => $terkait,
        ]);
    }

    public function kategori(): JsonResponse
    {
        $kategori = Produk::query()
            ->select('kategori', DB::raw('COUNT(*) as jumlah'))
            ->groupBy('kategori')
            ->orderBy('kategori')
            ->get();

        return response()->json([
            'data' => $kategori,
            'total_produk' => (int) Produk::count(),
        ]);
    }
}
