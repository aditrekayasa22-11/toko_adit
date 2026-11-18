<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProdukController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

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
                    ->orWhere('produk.kategori', 'like', "%{$search}%")
                    ->orWhere('produk.kode_produk', 'like', "%{$search}%");
            });
        }

        if ($kategori = $request->query('kategori')) {
            $query->where('produk.kategori', $kategori);
        }

        $paginator = $query->orderByDesc('produk.created_at')->paginate($perPage)->withQueryString();

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->validasi($request));

        if ($request->hasFile('gambar')) {
            $data['gambar'] = $request->file('gambar')->store('produk', 'public');
        }

        $produk = Produk::create($data);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $produk->toApiArray(),
        ], 201);
    }

    public function show(Produk $produk): JsonResponse
    {
        return response()->json(['data' => $produk->toApiArray()]);
    }

    public function update(Request $request, Produk $produk): JsonResponse
    {
        $data = $request->validate($this->validasi($request, $produk->id_produk));

        $gambarLama = $produk->gambar;
        if ($request->hasFile('gambar')) {
            $data['gambar'] = $request->file('gambar')->store('produk', 'public');
        }

        $produk->update($data);

        if ($request->hasFile('gambar') && str_starts_with((string) $gambarLama, 'produk/')) {
            Storage::disk('public')->delete($gambarLama);
        }

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $produk->fresh()->toApiArray(),
        ]);
    }

    public function destroy(Produk $produk): JsonResponse
    {
        $gambar = $produk->gambar;
        $produk->delete();

        if (str_starts_with((string) $gambar, 'produk/')) {
            Storage::disk('public')->delete($gambar);
        }

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    private function validasi(Request $request, ?int $id = null): array
    {
        return [
            'kode_produk' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('produk', 'kode_produk')->ignore($id, 'id_produk'),
            ],
            'nama_produk' => [
                'required',
                'string',
                'max:100',
                Rule::unique('produk', 'nama_produk')->ignore($id, 'id_produk'),
            ],
            'kategori' => ['required', 'string', 'max:50'],
            'harga' => ['required', 'numeric', 'min:0'],
            'stok' => ['required', 'integer', 'min:0'],
            'deskripsi' => ['nullable', 'string'],
            'gambar' => $request->hasFile('gambar')
                ? ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']
                : ['nullable', 'string', 'max:100'],
        ];
    }
}
