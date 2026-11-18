<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $primaryKey = 'id_transaksi';

    public $timestamps = false;

    protected $fillable = [
        'id_pelanggan',
        'kode_transaksi',
        'id_kasir',
        'tanggal_transaksi',
        'nama_produk',
        'jumlah',
        'total_harga',
        'diskon',
        'metode_pembayaran',
        'jumlah_bayar',
        'kembalian',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_transaksi' => 'date:Y-m-d',
            'jumlah' => 'integer',
            'total_harga' => 'float',
            'diskon' => 'float',
            'jumlah_bayar' => 'float',
            'kembalian' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_transaksi';
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }
}
