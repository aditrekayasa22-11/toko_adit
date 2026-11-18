<?php

namespace App\Http\Controllers;

use App\Models\Pelanggan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'telepon' => ['required', 'string', 'max:15'],
            'alamat' => ['required', 'string'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $pelanggan = Pelanggan::create([
                'nama_pelanggan' => $data['name'],
                'alamat' => $data['alamat'],
                'telepon' => $data['telepon'],
            ]);

            return User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'pelanggan',
                'id_pelanggan' => $pelanggan->id_pelanggan,
            ]);
        });

        $token = $user->createToken('tokokita-app')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil. Selamat berbelanja!',
            'token' => $token,
            'user' => $user->load('pelanggan')->toApiArray(),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password yang Anda masukkan salah.',
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('tokokita-app')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => $user->load('pelanggan')->toApiArray(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('pelanggan')->toApiArray(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Anda telah keluar dari akun.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'telepon' => ['nullable', 'string', 'max:15'],
            'alamat' => ['nullable', 'string'],
            'current_password' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
        ]);

        if ($request->filled('password')) {
            if (! Hash::check((string) $request->input('current_password'), $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => 'Password saat ini tidak sesuai.',
                ]);
            }
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        unset($data['current_password']);

        DB::transaction(function () use ($user, $data, $request) {
            $user->update($data);

            if ($user->pelanggan) {
                $user->pelanggan->update([
                    'nama_pelanggan' => $data['name'],
                    'alamat' => $request->input('alamat', $user->pelanggan->alamat),
                    'telepon' => $request->input('telepon', $user->pelanggan->telepon),
                ]);
            }
        });

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $user->fresh('pelanggan')->toApiArray(),
        ]);
    }
}
