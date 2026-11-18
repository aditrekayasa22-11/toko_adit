<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PesananController extends Controller
{
    private array $transisi = [
        'pending' => ['diproses', 'dibatalkan'],
        'diproses' => ['dikirim', 'dibatalkan'],
        'dikirim' => ['selesai'],
        'selesai' => [],
        'dibatalkan' => [],
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Pesanan::with(['pelanggan', 'details'])->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            if (in_array($status, array_keys($this->transisi), true)) {
                $query->where('status', $status);
            }
        }

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_pesanan', 'like', "%{$search}%")
                    ->orWhereHas('pelanggan', fn ($p) => $p->where('nama_pelanggan', 'like', "%{$search}%"));
            });
        }

        $paginator = $query->paginate(10)->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())
                ->map(fn (Pesanan $pesanan) => $pesanan->toApiArray())
                ->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(Pesanan $pesanan): JsonResponse
    {
        return response()->json([
            'data' => $pesanan->load(['pelanggan', 'details'])->toApiArray(),
        ]);
    }

    public function updateStatus(Request $request, Pesanan $pesanan): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,diproses,dikirim,selesai,dibatalkan'],
        ]);

        $statusBaru = $data['status'];
        $statusLama = $pesanan->status;

        if ($statusBaru === $statusLama) {
            return response()->json([
                'message' => 'Status pesanan tidak berubah.',
                'data' => $pesanan->load(['pelanggan', 'details'])->toApiArray(),
            ]);
        }

        if (! in_array($statusBaru, $this->transisi[$statusLama] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => "Status tidak dapat diubah dari {$statusLama} menjadi {$statusBaru}.",
            ]);
        }

        DB::transaction(function () use ($pesanan, $statusBaru) {
            if ($statusBaru === 'dibatalkan') {
                foreach ($pesanan->details as $detail) {
                    if ($detail->id_produk) {
                        Produk::where('id_produk', $detail->id_produk)
                            ->increment('stok', $detail->jumlah);
                    }
                }
            }

            if ($statusBaru === 'selesai') {
                foreach ($pesanan->details as $detail) {
                    Transaksi::create([
                        'id_pelanggan' => $pesanan->id_pelanggan,
                        'tanggal_transaksi' => now()->toDateString(),
                        'nama_produk' => $detail->nama_produk,
                        'jumlah' => $detail->jumlah,
                        'total_harga' => $detail->subtotal,
                    ]);
                }
            }

            $pesanan->update(['status' => $statusBaru]);
        });

        return response()->json([
            'message' => "Status pesanan berhasil diubah menjadi {$statusBaru}.",
            'data' => $pesanan->fresh(['pelanggan', 'details'])->toApiArray(),
        ]);
    }
}
