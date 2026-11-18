<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class KasirSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'kasir@tokokita.id'],
            [
                'name' => 'Kasir TokoKita',
                'password' => 'kasir123',
                'role' => 'kasir',
                'id_pelanggan' => null,
            ]
        );
    }
}
