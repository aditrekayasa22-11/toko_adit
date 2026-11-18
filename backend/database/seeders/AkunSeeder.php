<?php

namespace Database\Seeders;

use App\Models\Pelanggan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AkunSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tokokita.id'],
            [
                'name' => 'Admin TokoKita',
                'password' => 'admin123',
                'role' => 'admin',
                'id_pelanggan' => null,
            ]
        );

        foreach (Pelanggan::all() as $pelanggan) {
            $email = Str::slug($pelanggan->nama_pelanggan, '.').'@tokokita.id';

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $pelanggan->nama_pelanggan,
                    'password' => 'pelanggan123',
                    'role' => 'pelanggan',
                    'id_pelanggan' => $pelanggan->id_pelanggan,
                ]
            );
        }
    }
}
