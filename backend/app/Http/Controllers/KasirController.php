<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class KasirController extends Controller
{
    public function options(): JsonResponse
    {
        return response()->json([
            'produk' => Produk::orderBy('nama_produk')->get()->map(fn (Produk $produk) => $produk->toApiArray()),
            'pelanggan' => Pelanggan::orderBy('nama_pelanggan')->limit(500)->get()->map(fn (Pelanggan $pelanggan) => $pelanggan->toApiArray()),
        ]);
    }

    public function accounts(Request $request): JsonResponse
    {
        $accounts = $request->user()->role === 'admin'
            ? \App\Models\User::where('role', 'kasir')->orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at'])
            : collect([$request->user()->only(['id', 'name', 'email', 'role', 'created_at'])]);

        return response()->json(['data' => $accounts]);
    }

    public function summary(): JsonResponse
    {
        $today = DB::table('transaksi')->whereDate('tanggal_transaksi', now()->toDateString())
            ->get(['id_transaksi', 'kode_transaksi', 'jumlah', 'total_harga']);
        $grouped = $today->groupBy(fn ($row) => $row->kode_transaksi ?: 'legacy-'.$row->id_transaksi);

        return response()->json([
            'tanggal' => now()->toDateString(),
            'jumlah_transaksi' => $grouped->count(),
            'total_item' => (int) $today->sum('jumlah'),
            'total_penjualan' => (float) $today->sum('total_harga'),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date', 'after_or_equal:dari'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = DB::table('transaksi as t')
            ->join('pelanggan as p', 't.id_pelanggan', '=', 'p.id_pelanggan')
            ->leftJoin('users as u', 't.id_kasir', '=', 'u.id')
            ->when($request->query('dari'), fn ($q, $date) => $q->whereDate('t.tanggal_transaksi', '>=', $date))
            ->when($request->query('sampai'), fn ($q, $date) => $q->whereDate('t.tanggal_transaksi', '<=', $date))
            ->when(trim((string) $request->query('search')), function ($q) use ($request) {
                $term = trim((string) $request->query('search'));
                $q->where(function ($nested) use ($term) {
                    $nested->where('t.kode_transaksi', 'like', "%{$term}%")
                        ->orWhere('p.nama_pelanggan', 'like', "%{$term}%")
                        ->orWhere('t.nama_produk', 'like', "%{$term}%");
                });
            });

        $keyExpression = "COALESCE(t.kode_transaksi, CONCAT('TRX-', t.id_transaksi))";
        $sales = (clone $query)
            ->selectRaw("{$keyExpression} as kode_transaksi")
            ->selectRaw('MIN(t.id_transaksi) as id_awal, MAX(t.tanggal_transaksi) as tanggal_transaksi, MAX(t.id_pelanggan) as id_pelanggan, MAX(p.nama_pelanggan) as nama_pelanggan, MAX(u.name) as nama_kasir')
            ->selectRaw("COALESCE(MAX(t.metode_pembayaran), 'lainnya') as metode_pembayaran, SUM(t.total_harga) as total_harga, COALESCE(SUM(t.diskon), 0) as diskon_total, COALESCE(MAX(t.jumlah_bayar), SUM(t.total_harga)) as jumlah_bayar, COALESCE(MAX(t.kembalian), 0) as kembalian")
            ->groupByRaw($keyExpression)
            ->orderByDesc('tanggal_transaksi')
            ->orderByDesc('id_awal')
            ->paginate(min(max((int) $request->query('per_page', 15), 1), 50))
            ->withQueryString();

        $pageRows = collect($sales->items());
        $realCodes = $pageRows->filter(fn ($sale) => ! str_starts_with($sale->kode_transaksi, 'TRX-'))->pluck('kode_transaksi')->all();
        $legacyIds = $pageRows->filter(fn ($sale) => str_starts_with($sale->kode_transaksi, 'TRX-'))->map(fn ($sale) => (int) str_replace('TRX-', '', $sale->kode_transaksi))->all();
        $details = DB::table('transaksi')
            ->whereIn('kode_transaksi', $realCodes)
            ->when($legacyIds, fn ($q) => $q->orWhereIn('id_transaksi', $legacyIds))
            ->get(['id_transaksi', 'kode_transaksi', 'nama_produk', 'jumlah', 'total_harga', 'diskon']);
        $detailsByCode = $details->groupBy(fn ($row) => $row->kode_transaksi ?: 'TRX-'.$row->id_transaksi);

        return response()->json([
            'data' => $pageRows->map(function ($sale) use ($detailsByCode) {
                $items = $detailsByCode->get($sale->kode_transaksi) ?? collect();
                return [
                    'kode_transaksi' => $sale->kode_transaksi,
                    'tanggal_transaksi' => $sale->tanggal_transaksi,
                    'id_pelanggan' => (int) $sale->id_pelanggan,
                    'nama_pelanggan' => $sale->nama_pelanggan,
                    'nama_kasir' => $sale->nama_kasir,
                    'metode_pembayaran' => $sale->metode_pembayaran,
                    'total_harga' => (float) ($items->isNotEmpty() ? $items->sum('total_harga') : $sale->total_harga),
                    'diskon_total' => (float) $items->sum('diskon'),
                    'subtotal' => (float) ($items->sum('total_harga') + $items->sum('diskon')),
                    'jumlah_bayar' => (float) $sale->jumlah_bayar,
                    'kembalian' => (float) $sale->kembalian,
                    'items' => $items->map(fn ($row) => [
                        'nama_produk' => $row->nama_produk,
                        'jumlah' => (int) $row->jumlah,
                        'total_harga' => (float) $row->total_harga,
                        'diskon' => (float) ($row->diskon ?? 0),
                    ])->values(),
                ];
            })->values(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $transactions = DB::table('transaksi as t')
            ->select('t.id_pelanggan')
            ->selectRaw('COUNT(DISTINCT t.kode_transaksi) + SUM(CASE WHEN t.kode_transaksi IS NULL THEN 1 ELSE 0 END) as jumlah_transaksi')
            ->selectRaw('SUM(t.total_harga) as total_belanja')
            ->groupBy('t.id_pelanggan');

        $query = DB::table('pelanggan as p')
            ->leftJoinSub($transactions, 'v', 'p.id_pelanggan', '=', 'v.id_pelanggan')
            ->when(trim((string) $request->query('search')), function ($q) use ($request) {
                $term = trim((string) $request->query('search'));
                $q->where(fn ($nested) => $nested->where('p.nama_pelanggan', 'like', "%{$term}%")
                    ->orWhere('p.telepon', 'like', "%{$term}%")
                    ->orWhere('p.alamat', 'like', "%{$term}%"));
            });

        $customers = $query->select('p.id_pelanggan', 'p.nama_pelanggan', 'p.alamat', 'p.telepon')
            ->selectRaw('COALESCE(v.jumlah_transaksi, 0) as jumlah_transaksi, COALESCE(v.total_belanja, 0) as total_belanja')
            ->orderBy('p.nama_pelanggan')->paginate(15)->withQueryString();

        return response()->json([
            'data' => collect($customers->items())->map(fn ($customer) => [
                'id_pelanggan' => (int) $customer->id_pelanggan,
                'nama_pelanggan' => $customer->nama_pelanggan,
                'alamat' => $customer->alamat,
                'telepon' => $customer->telepon,
                'jumlah_transaksi' => (int) $customer->jumlah_transaksi,
                'total_belanja' => (float) $customer->total_belanja,
            ])->values(),
            'meta' => ['current_page' => $customers->currentPage(), 'last_page' => $customers->lastPage(), 'total' => $customers->total()],
        ]);
    }

    public function storeCustomer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string', 'max:1000'],
            'telepon' => ['required', 'string', 'max:15'],
        ]);
        $customer = Pelanggan::create($data);

        return response()->json(['message' => 'Data pelanggan ditambahkan.', 'data' => $customer->toApiArray()], 201);
    }

    public function updateCustomer(Request $request, Pelanggan $pelanggan): JsonResponse
    {
        $data = $request->validate([
            'nama_pelanggan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string', 'max:1000'],
            'telepon' => ['required', 'string', 'max:15'],
        ]);
        $pelanggan->update($data);
        if ($pelanggan->user) {
            $pelanggan->user->update(['name' => $data['nama_pelanggan']]);
        }

        return response()->json(['message' => 'Data pelanggan diperbarui.', 'data' => $pelanggan->toApiArray()]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id_produk' => ['required', 'integer', 'exists:produk,id_produk'],
            'items.*.jumlah' => ['required', 'integer', 'min:1', 'max:999'],
            'id_pelanggan' => ['nullable', 'integer', 'exists:pelanggan,id_pelanggan'],
            'metode_pembayaran' => ['required', 'in:tunai,qris,transfer'],
            'jumlah_bayar' => ['required', 'numeric', 'min:0'],
            'tipe_diskon' => ['nullable', 'in:persen,nominal'],
            'nilai_diskon' => ['nullable', 'numeric', 'min:0'],
        ]);
        if (($data['tipe_diskon'] ?? null) === 'persen' && ($data['nilai_diskon'] ?? 0) > 100) {
            throw ValidationException::withMessages(['nilai_diskon' => 'Diskon persen maksimal 100%.']);
        }

        $diminta = collect($data['items'])->groupBy('id_produk')
            ->map(fn (Collection $items) => (int) $items->sum('jumlah'));

        $sale = DB::transaction(function () use ($request, $data, $diminta) {
            $produkMap = Produk::whereIn('id_produk', $diminta->keys())->lockForUpdate()->get()->keyBy('id_produk');
            $details = [];
            $total = 0;

            foreach ($diminta as $idProduk => $jumlah) {
                $produk = $produkMap->get($idProduk);
                if (! $produk || $produk->stok < $jumlah) {
                    throw ValidationException::withMessages([
                        'items' => 'Stok '.($produk?->nama_produk ?? 'produk'). ' tidak mencukupi. Stok tersedia: '.($produk?->stok ?? 0).'.',
                    ]);
                }
                $subtotal = (float) $produk->harga * $jumlah;
                $total += $subtotal;
                $details[] = ['produk' => $produk, 'jumlah' => $jumlah, 'subtotal' => $subtotal];
            }

            $diskon = min($total, ($data['tipe_diskon'] ?? '') === 'persen'
                ? $total * (float) ($data['nilai_diskon'] ?? 0) / 100
                : (float) ($data['nilai_diskon'] ?? 0));
            $totalAkhir = max(0, $total - $diskon);
            $sisaDiskon = round($diskon, 2);
            foreach ($details as $index => &$detail) {
                $bagianDiskon = $index === array_key_last($details)
                    ? $sisaDiskon
                    : round($total > 0 ? $diskon * $detail['subtotal'] / $total : 0, 2);
                $detail['diskon'] = $bagianDiskon;
                $detail['total_akhir'] = round($detail['subtotal'] - $bagianDiskon, 2);
                $sisaDiskon = round($sisaDiskon - $bagianDiskon, 2);
            }
            unset($detail);

            $jumlahBayar = $data['metode_pembayaran'] === 'tunai' ? (float) $data['jumlah_bayar'] : $totalAkhir;
            if ($jumlahBayar < $totalAkhir) {
                throw ValidationException::withMessages(['jumlah_bayar' => 'Jumlah pembayaran masih kurang dari total belanja.']);
            }

            $pelanggan = isset($data['id_pelanggan'])
                ? Pelanggan::findOrFail($data['id_pelanggan'])
                : Pelanggan::firstOrCreate(
                    ['nama_pelanggan' => 'Pelanggan Umum'],
                    ['alamat' => '-', 'telepon' => '-']
                );
            $kode = 'AD-'.now()->format('ymdHis').'-'.Str::upper(Str::random(4));
            $kembalian = max(0, $jumlahBayar - $totalAkhir);

            foreach ($details as $detail) {
                /** @var Produk $produk */
                $produk = $detail['produk'];
                Transaksi::create([
                    'id_pelanggan' => $pelanggan->id_pelanggan,
                    'id_kasir' => $request->user()->id,
                    'kode_transaksi' => $kode,
                    'tanggal_transaksi' => now()->toDateString(),
                    'nama_produk' => $produk->nama_produk,
                    'jumlah' => $detail['jumlah'],
                    'total_harga' => $detail['total_akhir'],
                    'diskon' => $detail['diskon'],
                    'metode_pembayaran' => $data['metode_pembayaran'],
                    'jumlah_bayar' => $jumlahBayar,
                    'kembalian' => $kembalian,
                ]);
                $produk->decrement('stok', $detail['jumlah']);
            }

            return [
                'kode_transaksi' => $kode,
                'tanggal_transaksi' => now()->toDateTimeString(),
                'nama_pelanggan' => $pelanggan->nama_pelanggan,
                'nama_kasir' => $request->user()->name,
                'metode_pembayaran' => $data['metode_pembayaran'],
                'subtotal' => $total,
                'diskon_total' => $diskon,
                'total_harga' => $totalAkhir,
                'jumlah_bayar' => $jumlahBayar,
                'kembalian' => $kembalian,
                'items' => collect($details)->map(fn ($detail) => [
                    'nama_produk' => $detail['produk']->nama_produk,
                    'harga' => (float) $detail['produk']->harga,
                    'jumlah' => $detail['jumlah'],
                    'total_harga' => $detail['total_akhir'],
                    'diskon' => $detail['diskon'],
                ])->values(),
            ];
        });

        return response()->json(['message' => 'Transaksi berhasil disimpan.', 'data' => $sale], 201);
    }
}
