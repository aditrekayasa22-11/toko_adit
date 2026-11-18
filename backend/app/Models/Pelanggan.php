<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Pelanggan extends Model
{
    protected $table = 'pelanggan';

    protected $primaryKey = 'id_pelanggan';

    public $timestamps = false;

    protected $fillable = [
        'nama_pelanggan',
        'alamat',
        'telepon',
    ];

    public function getRouteKeyName(): string
    {
        return 'id_pelanggan';
    }

    public function toApiArray(): array
    {
        return [
            'id_pelanggan' => $this->id_pelanggan,
            'nama_pelanggan' => $this->nama_pelanggan,
            'alamat' => $this->alamat,
            'telepon' => $this->telepon,
        ];
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function pesanan(): HasMany
    {
        return $this->hasMany(Pesanan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function ringkasanBelanja(): array
    {
        $ringkasan = DB::table('view_total_belanja')
            ->where('id_pelanggan', $this->id_pelanggan)
            ->first();

        return [
            'jumlah_transaksi' => (int) ($ringkasan->jumlah_transaksi ?? 0),
            'total_keseluruhan_belanja' => (float) ($ringkasan->total_keseluruhan_belanja ?? 0),
        ];
    }
}
