<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPesanan extends Model
{
    protected $table = 'detail_pesanan';

    protected $primaryKey = 'id_detail';

    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'id_produk',
        'nama_produk',
        'harga',
        'jumlah',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'float',
            'jumlah' => 'integer',
            'subtotal' => 'float',
        ];
    }

    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'id_pesanan', 'id_pesanan');
    }

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id_produk');
    }

    public function toApiArray(): array
    {
        return [
            'id_detail' => $this->id_detail,
            'id_produk' => $this->id_produk,
            'nama_produk' => $this->nama_produk,
            'harga' => (float) $this->harga,
            'jumlah' => (int) $this->jumlah,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
