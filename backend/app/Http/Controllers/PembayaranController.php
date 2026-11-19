<?php

namespace App\Http\Controllers;

use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PembayaranController extends Controller
{
    public function buatInvoice(Request $request, Pesanan $pesanan): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;
        if (! $pelanggan || $pesanan->id_pelanggan !== $pelanggan->id_pelanggan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if ($pesanan->metode_pembayaran === 'cod') {
            return response()->json(['message' => 'Pesanan COD tidak memerlukan invoice online.'], 422);
        }

        if ($pesanan->duitku_payment_url) {
            return response()->json(['data' => [
                'payment_url' => $pesanan->duitku_payment_url,
                'reference' => $pesanan->duitku_reference,
            ]]);
        }

        $merchantCode = (string) config('services.duitku.merchant_code');
        $apiKey = (string) config('services.duitku.api_key');
        $callbackUrl = (string) config('services.duitku.callback_url');
        $returnBase = rtrim((string) config('services.duitku.return_url'), '/');
        if ($merchantCode === '' || $apiKey === '' || $callbackUrl === '' || $returnBase === '') {
            return response()->json(['message' => 'Konfigurasi pembayaran Duitku belum lengkap.'], 503);
        }

        $timestamp = (string) round(microtime(true) * 1000);
        $signature = hash_hmac('sha256', $merchantCode.$timestamp, $apiKey);
        $user = $request->user();
        $customerName = mb_substr($pelanggan->nama_pelanggan ?: $user->name, 0, 20);
        $phone = $pelanggan->telepon ?: '';
        $returnUrl = $returnBase.'/pesanan/'.$pesanan->id_pesanan.'?pembayaran=selesai';

        $itemDetails = $pesanan->details->map(fn ($item) => [
            'name' => mb_substr($item->nama_produk, 0, 100),
            'price' => (int) round($item->harga),
            'quantity' => (int) $item->jumlah,
        ])->values()->all();
        if ((int) round($pesanan->ongkir) > 0) {
            $itemDetails[] = [
                'name' => 'Ongkos kirim',
                'price' => (int) round($pesanan->ongkir),
                'quantity' => 1,
            ];
        }

        $body = [
            'paymentAmount' => (int) round($pesanan->total_harga),
            'merchantOrderId' => $pesanan->kode_pesanan,
            'productDetails' => 'Pesanan TokoKita '.$pesanan->kode_pesanan,
            'customerVaName' => $customerName,
            'email' => $user->email,
            'phoneNumber' => $phone,
            'itemDetails' => $itemDetails,
            'callbackUrl' => $callbackUrl,
            'returnUrl' => $returnUrl,
            'expiryPeriod' => 60,
        ];

        try {
            $response = Http::acceptJson()
                ->withHeaders([
                    'x-duitku-signature' => $signature,
                    'x-duitku-timestamp' => $timestamp,
                    'x-duitku-merchantcode' => $merchantCode,
                ])
                ->timeout(20)
                ->post(rtrim((string) config('services.duitku.base_url'), '/').'/api/merchant/createInvoice', $body);
        } catch (\Throwable $exception) {
            Log::warning('Duitku invoice request failed', ['order' => $pesanan->kode_pesanan]);
            return response()->json(['message' => 'Tidak dapat terhubung ke Duitku. Coba lagi sebentar.'], 502);
        }

        $result = $response->json();
        if (! $response->successful() || ($result['statusCode'] ?? null) !== '00'
            || empty($result['paymentUrl']) || empty($result['reference'])) {
            $providerMessage = $result['statusMessage'] ?? $result['message'] ?? null;
            Log::warning('Duitku invoice rejected', [
                'order' => $pesanan->kode_pesanan,
                'status_code' => $result['statusCode'] ?? $response->status(),
                'provider_message' => $providerMessage,
            ]);
            return response()->json([
                'message' => $providerMessage ?: 'Duitku gagal membuat invoice. Silakan coba lagi.',
            ], 502);
        }

        $pesanan->update([
            'duitku_reference' => $result['reference'],
            'duitku_payment_url' => $result['paymentUrl'],
            'status_pembayaran' => 'menunggu',
        ]);

        return response()->json(['data' => [
            'payment_url' => $pesanan->duitku_payment_url,
            'reference' => $pesanan->duitku_reference,
        ]]);
    }

    public function callback(Request $request)
    {
        $data = $request->validate([
            'merchantCode' => ['required', 'string'],
            'amount' => ['required', 'numeric'],
            'merchantOrderId' => ['required', 'string'],
            'resultCode' => ['required', 'string'],
            'reference' => ['required', 'string'],
            'signature' => ['required', 'string'],
        ]);

        $merchantCode = (string) config('services.duitku.merchant_code');
        $apiKey = (string) config('services.duitku.api_key');
        $expected = hash_hmac('sha256', $data['merchantCode'].$data['amount'].$data['merchantOrderId'], $apiKey);
        if ($merchantCode === '' || $apiKey === '' || $data['merchantCode'] !== $merchantCode
            || ! hash_equals($expected, strtolower($data['signature']))) {
            Log::warning('Duitku callback signature validation failed');
            return response('Invalid signature', 401);
        }

        $pesanan = Pesanan::where('kode_pesanan', $data['merchantOrderId'])->first();
        if (! $pesanan || (int) round($pesanan->total_harga) !== (int) round((float) $data['amount'])) {
            return response('Order not found or amount mismatch', 404);
        }
        if ($pesanan->duitku_reference && ! hash_equals($pesanan->duitku_reference, $data['reference'])) {
            return response('Reference mismatch', 400);
        }

        if ($pesanan->status_pembayaran !== 'dibayar') {
            $pesanan->update([
                'status_pembayaran' => $data['resultCode'] === '00' ? 'dibayar' : 'gagal',
                'status' => $data['resultCode'] === '00' && $pesanan->status === 'pending'
                    ? 'diproses'
                    : $pesanan->status,
                'duitku_reference' => $pesanan->duitku_reference ?: $data['reference'],
            ]);
        }

        return response('OK');
    }

    public function verifikasi(Request $request, Pesanan $pesanan): JsonResponse
    {
        $pelanggan = $request->user()->pelanggan;
        if (! $pelanggan || $pesanan->id_pelanggan !== $pelanggan->id_pelanggan) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if ($pesanan->status_pembayaran === 'dibayar') {
            return response()->json(['data' => $pesanan->fresh()->toApiArray()]);
        }
        if ($pesanan->metode_pembayaran === 'cod' || ! $pesanan->duitku_reference) {
            return response()->json(['message' => 'Invoice Duitku untuk pesanan ini belum tersedia.'], 422);
        }

        $merchantCode = (string) config('services.duitku.merchant_code');
        $apiKey = (string) config('services.duitku.api_key');
        $orderCode = (string) $pesanan->kode_pesanan;
        $signature = hash_hmac('sha256', $merchantCode.$orderCode, $apiKey);

        try {
            $response = Http::acceptJson()
                ->timeout(15)
                ->post((string) config('services.duitku.status_url'), [
                    'merchantCode' => $merchantCode,
                    'merchantOrderId' => $orderCode,
                    'signature' => $signature,
                ]);
        } catch (\Throwable $exception) {
            Log::warning('Duitku status inquiry failed', ['order' => $orderCode]);
            return response()->json(['message' => 'Status pembayaran belum dapat diverifikasi. Coba muat ulang sebentar lagi.'], 502);
        }

        $result = $response->json();
        if (! $response->successful()
            || ($result['merchantOrderId'] ?? null) !== $orderCode
            || (int) round((float) ($result['amount'] ?? 0)) !== (int) round($pesanan->total_harga)) {
            Log::warning('Duitku status response invalid', ['order' => $orderCode, 'http_status' => $response->status()]);
            return response()->json(['message' => 'Duitku belum dapat memverifikasi pembayaran pesanan ini.'], 502);
        }

        if (($result['statusCode'] ?? null) === '00') {
            if ($pesanan->duitku_reference && ! hash_equals($pesanan->duitku_reference, (string) ($result['reference'] ?? ''))) {
                return response()->json(['message' => 'Referensi pembayaran tidak cocok dengan invoice pesanan.'], 409);
            }
            $pesanan->update([
                'status_pembayaran' => 'dibayar',
                'status' => $pesanan->status === 'pending' ? 'diproses' : $pesanan->status,
            ]);
        }

        return response()->json(['data' => $pesanan->fresh()->toApiArray()]);
    }
}
