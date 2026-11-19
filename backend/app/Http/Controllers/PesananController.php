<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use App\Models\Produk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PesananController extends Controller
{
    private const ONGKIR = 20000;

    private const GRATIS_ONGKIR_MIN = 300000;

    public function index(Request $request): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;

        if (! $pelanggan) {
            return response()->json(['data' => [], 'meta' => $this->metaEmpty()]);
        }

        $query = Pesanan::with('details')
            ->where('id_pelanggan', $pelanggan->id_pelanggan)
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            if (in_array($status, ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'], true)) {
                $query->where('status', $status);
            }
        }

        $paginator = $query->paginate(10);

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id_produk' => ['required', 'integer', 'exists:produk,id_produk'],
            'items.*.jumlah' => ['required', 'integer', 'min:1', 'max:99'],
            'alamat_pengiriman' => ['required', 'string'],
            'metode_pembayaran' => ['required', 'in:transfer_bank,cod,qris,ewallet'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ]);

        $pelanggan = $request->user()->pelanggan;

        if (! $pelanggan) {
            throw ValidationException::withMessages([
                'items' => 'Akun Anda belum terhubung dengan data pelanggan.',
            ]);
        }

        $diminta = collect($data['items'])
            ->groupBy('id_produk')
            ->map(fn (Collection $rows) => (int) $rows->sum('jumlah'));

        $pesanan = DB::transaction(function () use ($data, $diminta, $pelanggan) {
            $produkMap = Produk::whereIn('id_produk', $diminta->keys())
                ->lockForUpdate()
                ->get()
                ->keyBy('id_produk');

            $details = [];
            $subtotal = 0;

            foreach ($diminta as $idProduk => $jumlah) {
                $produk = $produkMap->get($idProduk);

                if (! $produk) {
                    throw ValidationException::withMessages([
                        'items' => "Produk dengan ID {$idProduk} tidak ditemukan.",
                    ]);
                }

                if ($produk->stok < $jumlah) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$produk->nama_produk} tidak cukup. Tersisa {$produk->stok}.",
                    ]);
                }

                $itemSubtotal = $produk->harga * $jumlah;
                $subtotal += $itemSubtotal;
                $details[] = [
                    'id_produk' => $produk->id_produk,
                    'nama_produk' => $produk->nama_produk,
                    'harga' => $produk->harga,
                    'jumlah' => $jumlah,
                    'subtotal' => $itemSubtotal,
                ];

                $produk->decrement('stok', $jumlah);
            }

            $ongkir = $subtotal >= self::GRATIS_ONGKIR_MIN ? 0 : self::ONGKIR;

            $pesanan = Pesanan::create([
                'kode_pesanan' => $this->generateKodePesanan(),
                'id_pelanggan' => $pelanggan->id_pelanggan,
                'tanggal_pesanan' => now()->toDateString(),
                'subtotal' => $subtotal,
                'ongkir' => $ongkir,
                'total_harga' => $subtotal + $ongkir,
                'status' => 'pending',
                'status_pembayaran' => $data['metode_pembayaran'] === 'cod' ? 'tidak_berlaku' : 'menunggu',
                'metode_pembayaran' => $data['metode_pembayaran'],
                'alamat_pengiriman' => $data['alamat_pengiriman'],
                'catatan' => $data['catatan'] ?? null,
            ]);

            $pesanan->details()->createMany($details);

            return $pesanan;
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.',
            'data' => $pesanan->load(['details', 'pelanggan'])->toApiArray(),
        ], 201);
    }

    public function show(Request $request, Pesanan $pesanan): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;

        if (! $pelanggan || $pesanan->id_pelanggan !== $pelanggan->id_pelanggan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => $pesanan->load(['details', 'pelanggan'])->toApiArray(),
        ]);
    }

    public function batalkan(Request $request, Pesanan $pesanan): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;

        if (! $pelanggan || $pesanan->id_pelanggan !== $pelanggan->id_pelanggan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if ($pesanan->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Pesanan hanya dapat dibatalkan saat masih menunggu konfirmasi.',
            ]);
        }

        if ($pesanan->status_pembayaran === 'dibayar') {
            throw ValidationException::withMessages([
                'status' => 'Pesanan yang sudah dibayar tidak dapat dibatalkan dari halaman ini.',
            ]);
        }

        DB::transaction(function () use ($pesanan) {
            $this->kembalikanStok($pesanan);
            $pesanan->update(['status' => 'dibatalkan']);
        });

        return response()->json([
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => $pesanan->fresh(['details', 'pelanggan'])->toApiArray(),
        ]);
    }

    public function statistikSaya(Request $request): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;

        if (! $pelanggan) {
            return response()->json([
                'jumlah_transaksi' => 0,
                'total_belanja' => 0,
                'total_pesanan' => 0,
                'pesanan_aktif' => 0,
            ]);
        }

        $ringkasan = $pelanggan->ringkasanBelanja();

        $totalPesanan = Pesanan::where('id_pelanggan', $pelanggan->id_pelanggan)->count();
        $pesananAktif = Pesanan::where('id_pelanggan', $pelanggan->id_pelanggan)
            ->whereIn('status', ['pending', 'diproses', 'dikirim'])
            ->count();

        return response()->json([
            'jumlah_transaksi' => $ringkasan['jumlah_transaksi'],
            'total_belanja' => $ringkasan['total_keseluruhan_belanja'],
            'total_pesanan' => $totalPesanan,
            'pesanan_aktif' => $pesananAktif,
        ]);
    }

    private function kembalikanStok(Pesanan $pesanan): void
    {
        foreach ($pesanan->details as $detail) {
            if ($detail->id_produk) {
                Produk::where('id_produk', $detail->id_produk)->increment('stok', $detail->jumlah);
            }
        }
    }

    private function generateKodePesanan(): string
    {
        $prefix = 'INV'.now()->format('Ymd');
        $urutan = Pesanan::whereDate('created_at', now()->toDateString())->count() + 1;

        do {
            $kode = $prefix.str_pad((string) $urutan, 4, '0', STR_PAD_LEFT);
            $urutan++;
        } while (Pesanan::where('kode_pesanan', $kode)->exists());

        return $kode;
    }

    private function metaEmpty(): array
    {
        return [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => 0,
        ];
    }
}
