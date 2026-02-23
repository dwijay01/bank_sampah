<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserLevel;
use App\Models\WasteType;
use App\Models\Courier;
use App\Models\Transaction;
use App\Models\PickupRequest;
use App\Models\WithdrawalRequest;
use App\Models\WarungPartner;
use App\Models\RtRwGroup;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ===== USER LEVELS =====
        $levels = [
            ['name' => 'Pemula Hijau', 'min_points' => 0, 'max_points' => 500, 'icon' => '🌱', 'color' => '#86EFAC'],
            ['name' => 'Pejuang Lingkungan', 'min_points' => 501, 'max_points' => 2000, 'icon' => '♻️', 'color' => '#34D399'],
            ['name' => 'Duta Bumi', 'min_points' => 2001, 'max_points' => 5000, 'icon' => '🌍', 'color' => '#10B981'],
            ['name' => 'Pahlawan Bumi', 'min_points' => 5001, 'max_points' => 99999, 'icon' => '🏆', 'color' => '#059669'],
        ];
        foreach ($levels as $level) {
            UserLevel::create($level);
        }

        // ===== ADMIN USER =====
        User::create([
            'name' => 'Admin Desa',
            'email' => 'admin@lumbunghijau.id',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'eco_points' => 0,
        ]);

        // ===== WARGA USERS =====
        $warga = [
            ['name' => 'Ahmad Rusdi', 'email' => 'ahmad@lumbunghijau.id', 'eco_points' => 5200, 'phone' => '081234567010'],
            ['name' => 'Siti Aminah', 'email' => 'siti@warga.id', 'eco_points' => 3800, 'phone' => '081234567011'],
            ['name' => 'Budi Santoso', 'email' => 'budi@warga.id', 'eco_points' => 12000, 'phone' => '081234567012'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@warga.id', 'eco_points' => 7500, 'phone' => '081234567013'],
            ['name' => 'Rudi Hermawan', 'email' => 'rudi@warga.id', 'eco_points' => 2100, 'phone' => '081234567014'],
        ];
        foreach ($warga as $w) {
            User::create([
                ...$w,
                'password' => bcrypt('password'),
                'role' => 'warga',
            ]);
        }

        // ===== WASTE TYPES =====
        $wasteTypes = [
            ['name' => 'Plastik PET', 'price_per_kg' => 3500],
            ['name' => 'Plastik HDPE', 'price_per_kg' => 4000],
            ['name' => 'Kardus', 'price_per_kg' => 2000],
            ['name' => 'Kertas HVS', 'price_per_kg' => 2500],
            ['name' => 'Besi', 'price_per_kg' => 5000],
            ['name' => 'Aluminium', 'price_per_kg' => 12000],
            ['name' => 'Kaca/Botol', 'price_per_kg' => 1500],
            ['name' => 'Elektronik', 'price_per_kg' => 8000],
        ];
        foreach ($wasteTypes as $wt) {
            WasteType::create($wt);
        }

        // ===== COURIERS (with user accounts) =====
        $couriers = [
            ['name' => 'Pak Joko', 'phone' => '081234567001', 'email' => 'joko@kurir.id'],
            ['name' => 'Pak Dedi', 'phone' => '081234567002', 'email' => 'dedi@kurir.id'],
            ['name' => 'Pak Surya', 'phone' => '081234567003', 'email' => 'surya@kurir.id'],
            ['name' => 'Pak Hendra', 'phone' => '081234567004', 'email' => 'hendra@kurir.id'],
        ];
        foreach ($couriers as $c) {
            $user = User::create([
                'name' => $c['name'],
                'email' => $c['email'],
                'phone' => $c['phone'],
                'password' => bcrypt('password'),
                'role' => 'kurir',
            ]);
            Courier::create([
                'name' => $c['name'],
                'phone' => $c['phone'],
                'user_id' => $user->id,
            ]);
        }

        // ===== TRANSACTIONS =====
        $transactions = [
            ['user_id' => 2, 'waste_type_id' => 1, 'service_type' => 'Drop-off', 'weight_kg' => 5.2, 'points_earned' => 520, 'status' => 'Selesai', 'created_at' => Carbon::today()],
            ['user_id' => 3, 'waste_type_id' => 3, 'service_type' => 'Jemput', 'weight_kg' => 3.8, 'points_earned' => 380, 'status' => 'Menunggu', 'created_at' => Carbon::today()],
            ['user_id' => 4, 'waste_type_id' => 3, 'service_type' => 'Drop-off', 'weight_kg' => 12.0, 'points_earned' => 1200, 'status' => 'Selesai', 'created_at' => Carbon::today()],
            ['user_id' => 5, 'waste_type_id' => 5, 'service_type' => 'Jemput', 'weight_kg' => 7.5, 'points_earned' => 750, 'status' => 'Dijemput', 'created_at' => Carbon::today()],
            ['user_id' => 6, 'waste_type_id' => 1, 'service_type' => 'Drop-off', 'weight_kg' => 2.1, 'points_earned' => 210, 'status' => 'Menunggu', 'created_at' => Carbon::today()],
            // Historical data for chart
            ['user_id' => 2, 'waste_type_id' => 1, 'service_type' => 'Drop-off', 'weight_kg' => 120, 'points_earned' => 12000, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(6)],
            ['user_id' => 3, 'waste_type_id' => 3, 'service_type' => 'Drop-off', 'weight_kg' => 98, 'points_earned' => 9800, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(5)],
            ['user_id' => 4, 'waste_type_id' => 5, 'service_type' => 'Jemput', 'weight_kg' => 145, 'points_earned' => 14500, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(4)],
            ['user_id' => 5, 'waste_type_id' => 1, 'service_type' => 'Drop-off', 'weight_kg' => 130, 'points_earned' => 13000, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(3)],
            ['user_id' => 6, 'waste_type_id' => 3, 'service_type' => 'Drop-off', 'weight_kg' => 160, 'points_earned' => 16000, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(2)],
            ['user_id' => 2, 'waste_type_id' => 5, 'service_type' => 'Jemput', 'weight_kg' => 175, 'points_earned' => 17500, 'status' => 'Selesai', 'created_at' => Carbon::today()->subDays(1)],
        ];
        foreach ($transactions as $t) {
            Transaction::create($t);
        }

        // ===== PICKUP REQUESTS =====
        $pickupRequests = [
            ['user_id' => 3, 'address' => 'Jl. Melati No. 12, RT 03/RW 05', 'waste_description' => 'Plastik, Kardus', 'estimated_weight' => '5 Kg', 'courier_id' => null, 'status' => 'Menunggu'],
            ['user_id' => 6, 'address' => 'Jl. Anggrek No. 8, RT 01/RW 02', 'waste_description' => 'Besi, Plastik', 'estimated_weight' => '8 Kg', 'courier_id' => null, 'status' => 'Menunggu'],
            ['user_id' => 5, 'address' => 'Jl. Dahlia No. 22, RT 07/RW 03', 'waste_description' => 'Kardus', 'estimated_weight' => '3 Kg', 'courier_id' => 1, 'status' => 'Ditugaskan'],
            ['user_id' => 4, 'address' => 'Jl. Mawar No. 5, RT 02/RW 01', 'waste_description' => 'Plastik', 'estimated_weight' => '4 Kg', 'courier_id' => 2, 'status' => 'Dijemput'],
        ];
        foreach ($pickupRequests as $pr) {
            PickupRequest::create($pr);
        }

        // ===== WITHDRAWAL REQUESTS =====
        $withdrawals = [
            ['user_id' => 2, 'points' => 5000, 'amount' => 'Rp 50.000', 'method' => 'Transfer Bank', 'status' => 'Menunggu', 'created_at' => Carbon::parse('2026-02-20')],
            ['user_id' => 3, 'points' => 3000, 'amount' => 'Rp 30.000', 'method' => 'E-Wallet', 'status' => 'Menunggu', 'created_at' => Carbon::parse('2026-02-19')],
            ['user_id' => 4, 'points' => 10000, 'amount' => 'Rp 100.000', 'method' => 'Transfer Bank', 'status' => 'Disetujui', 'created_at' => Carbon::parse('2026-02-18')],
            ['user_id' => 5, 'points' => 2000, 'amount' => 'Rp 20.000', 'method' => 'Voucher Warung', 'status' => 'Ditolak', 'created_at' => Carbon::parse('2026-02-18')],
        ];
        foreach ($withdrawals as $w) {
            WithdrawalRequest::create($w);
        }

        // ===== WARUNG PARTNERS =====
        $partners = [
            ['name' => 'Warung Bu Tini', 'email' => 'tini@mitra.id', 'phone' => '08111111111', 'address' => 'Jl. Kenanga No. 3', 'vouchers_redeemed' => 45, 'join_date' => '2025-08-15', 'status' => 'Aktif'],
            ['name' => 'Toko Pak Rahmat', 'email' => 'rahmat@mitra.id', 'phone' => '08111111112', 'address' => 'Jl. Flamboyan No. 10', 'vouchers_redeemed' => 32, 'join_date' => '2025-09-20', 'status' => 'Aktif'],
            ['name' => 'Warung Sejahtera', 'email' => 'sejahtera@mitra.id', 'phone' => '08111111113', 'address' => 'Jl. Cemara No. 7', 'vouchers_redeemed' => 18, 'join_date' => '2025-11-01', 'status' => 'Nonaktif'],
        ];
        foreach ($partners as $p) {
            $user = User::create([
                'name' => "Pemilik " . $p['name'],
                'email' => $p['email'],
                'phone' => $p['phone'],
                'password' => bcrypt('password'),
                'role' => 'mitra',
            ]);

            WarungPartner::create([
                'name' => $p['name'],
                'address' => $p['address'],
                'vouchers_redeemed' => $p['vouchers_redeemed'],
                'join_date' => $p['join_date'],
                'status' => $p['status'],
                'user_id' => $user->id // Need to add this to migration and model later if linking is strict. But for now, just Auth will work.
            ]);
        }

        // ===== RT/RW GROUPS =====
        $groups = [
            ['name' => 'RT 03 / RW 05', 'total_kg' => 450, 'total_points' => 45000, 'members_count' => 28],
            ['name' => 'RT 01 / RW 02', 'total_kg' => 380, 'total_points' => 38000, 'members_count' => 22],
            ['name' => 'RT 07 / RW 03', 'total_kg' => 320, 'total_points' => 32000, 'members_count' => 19],
            ['name' => 'RT 02 / RW 01', 'total_kg' => 290, 'total_points' => 29000, 'members_count' => 25],
            ['name' => 'RT 05 / RW 04', 'total_kg' => 210, 'total_points' => 21000, 'members_count' => 15],
        ];
        foreach ($groups as $g) {
            RtRwGroup::create($g);
        }

        // ===== REWARDS (TOKO POIN) =====
        $this->call(RewardSeeder::class);
    }
}
