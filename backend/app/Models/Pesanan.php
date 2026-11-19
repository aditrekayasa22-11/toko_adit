<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pesanan extends Model
{
    protected $table = 'pesanan';

    protected $primaryKey = 'id_pesanan';

    protected $fillable = [
        'kode_pesanan',
        'id_pelanggan',
        'tanggal_pesanan',
        'subtotal',
        'ongkir',
        'total_harga',
        'status',
        'metode_pembayaran',
        'status_pembayaran',
        'duitku_reference',
        'duitku_payment_url',
        'alamat_pengiriman',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_pesanan' => 'date:Y-m-d',
            'subtotal' => 'float',
            'ongkir' => 'float',
            'total_harga' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'id_pesanan';
    }

    public function pelanggan(): BelongsTo
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailPesanan::class, 'id_pesanan', 'id_pesanan');
    }

    public function toApiArray(): array
    {
        $details = $this->relationLoaded('details')
            ? $this->details->map(fn (DetailPesanan $detail) => $detail->toApiArray())->values()->all()
            : [];

        return [
            'id_pesanan' => $this->id_pesanan,
            'kode_pesanan' => $this->kode_pesanan,
            'tanggal_pesanan' => optional($this->tanggal_pesanan)->format('Y-m-d'),
            'subtotal' => (float) $this->subtotal,
            'ongkir' => (float) $this->ongkir,
            'total_harga' => (float) $this->total_harga,
            'status_pembayaran' => $this->status_pembayaran,
            'duitku_reference' => $this->duitku_reference,
            'duitku_payment_url' => $this->duitku_payment_url,
            'status' => $this->status,
            'metode_pembayaran' => $this->metode_pembayaran,
            'alamat_pengiriman' => $this->alamat_pengiriman,
            'catatan' => $this->catatan,
            'jumlah_item' => collect($details)->sum('jumlah'),
            'created_at' => optional($this->created_at)->toIso8601String(),
            'pelanggan' => $this->relationLoaded('pelanggan') && $this->pelanggan ? [
                'id_pelanggan' => $this->pelanggan->id_pelanggan,
                'nama_pelanggan' => $this->pelanggan->nama_pelanggan,
                'telepon' => $this->pelanggan->telepon,
                'alamat' => $this->pelanggan->alamat,
            ] : null,
            'details' => $details,
        ];
    }
}
