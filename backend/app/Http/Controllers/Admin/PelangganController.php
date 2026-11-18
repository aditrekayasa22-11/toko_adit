<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PelangganController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('pelanggan as p')
            ->leftJoin('view_total_belanja as v', 'p.id_pelanggan', '=', 'v.id_pelanggan')
            ->leftJoin('users as u', 'u.id_pelanggan', '=', 'p.id_pelanggan')
            ->select(
                'p.id_pelanggan',
                'p.nama_pelanggan',
                'p.alamat',
                'p.telepon',
                'u.email',
                DB::raw('COALESCE(v.jumlah_transaksi, 0) as jumlah_transaksi'),
                DB::raw('COALESCE(v.total_keseluruhan_belanja, 0) as total_belanja')
            );

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('p.nama_pelanggan', 'like', "%{$search}%")
                    ->orWhere('p.alamat', 'like', "%{$search}%")
                    ->orWhere('p.telepon', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('p.id_pelanggan')->paginate(10)->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn ($item) => [
                'id_pelanggan' => (int) $item->id_pelanggan,
                'nama_pelanggan' => $item->nama_pelanggan,
                'alamat' => $item->alamat,
                'telepon' => $item->telepon,
                'email' => $item->email,
                'jumlah_transaksi' => (int) $item->jumlah_transaksi,
                'total_belanja' => (float) $item->total_belanja,
            ])->values(),
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
            'data' => Pelanggan::orderBy('nama_pelanggan')
                ->get(['id_pelanggan', 'nama_pelanggan'])
                ->map(fn (Pelanggan $p) => $p->toApiArray()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string'],
            'telepon' => ['required', 'string', 'max:15'],
        ]);

        $pelanggan = Pelanggan::create($data);

        return response()->json([
            'message' => 'Data pelanggan berhasil ditambahkan.',
            'data' => $pelanggan->toApiArray(),
        ], 201);
    }

    public function show(Pelanggan $pelanggan): JsonResponse
    {
        return response()->json(['data' => $pelanggan->toApiArray()]);
    }

    public function update(Request $request, Pelanggan $pelanggan): JsonResponse
    {
        $data = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string'],
            'telepon' => ['required', 'string', 'max:15'],
        ]);

        $pelanggan->update($data);

        return response()->json([
            'message' => 'Data pelanggan berhasil diperbarui.',
            'data' => $pelanggan->toApiArray(),
        ]);
    }

    public function destroy(Pelanggan $pelanggan): JsonResponse
    {
        $pelanggan->delete();

        return response()->json(['message' => 'Data pelanggan berhasil dihapus.']);
    }
}
