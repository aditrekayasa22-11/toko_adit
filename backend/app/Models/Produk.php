<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Produk extends Model
{
    protected $table = 'produk';

    protected $primaryKey = 'id_produk';

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'kategori',
        'harga',
        'stok',
        'deskripsi',
        'gambar',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'float',
            'stok' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_produk';
    }

    public function toApiArray(): array
    {
        return [
            'id_produk' => $this->id_produk,
            'kode_produk' => $this->kode_produk,
            'nama_produk' => $this->nama_produk,
            'kategori' => $this->kategori,
            'harga' => (float) $this->harga,
            'stok' => (int) $this->stok,
            'deskripsi' => $this->deskripsi,
            'gambar' => str_starts_with((string) $this->gambar, 'produk/')
                ? Storage::disk('public')->url($this->gambar)
                : $this->gambar,
            'terjual' => (int) ($this->terjual ?? 0),
            'created_at' => optional($this->created_at)->toIso8601String(),
        ];
    }

    public function detailPesanan(): HasMany
    {
        return $this->hasMany(DetailPesanan::class, 'id_produk', 'id_produk');
    }
}
