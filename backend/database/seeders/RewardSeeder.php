<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RewardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rewards = [
            [
                'name' => 'Beras Premium 2.5 Kg',
                'description' => 'Beras kualitas super putih bersih dan pulen.',
                'points_cost' => 15000,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
            ],
            [
                'name' => 'Minyak Goreng 1 Liter',
                'description' => 'Minyak goreng kelapa sawit bernutrisi tinggi.',
                'points_cost' => 8500,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=400',
            ],
            [
                'name' => 'Gula Pasir 1 Kg',
                'description' => 'Gula pasir kristal murni untuk keluarga.',
                'points_cost' => 5000,
                'stock' => 200,
                'image_url' => 'https://images.unsplash.com/photo-1581457199047-197931c34a17?auto=format&fit=crop&q=80&w=400',
            ],
            [
                'name' => 'Voucher Diskon Rp 10.000',
                'description' => 'Voucher potongan belanja tunai di Warung Mitra manapun.',
                'points_cost' => 10000,
                'stock' => 999,
                'image_url' => 'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&q=80&w=400',
            ]
        ];

        foreach ($rewards as $reward) {
            \App\Models\Reward::create($reward);
        }
    }
}
