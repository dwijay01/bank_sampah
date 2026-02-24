<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WarungPartner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminPartnerController extends Controller
{
    public function index()
    {
        // Get partners with their related user info
        $partners = WarungPartner::with('user')->get()->map(function($partner) {
            // Hitung tagihan (total poin/harga dari voucher yang sudah mereka proses)
            // Asumsikan kita punya relasi vouchers di WarungPartner (one-to-many)
            // Tapi karena Vouchers tabel nyimpan partner_id, kita bisa hitung
            $completedVouchers = \App\Models\Voucher::with('reward')
                ->where('partner_id', $partner->id)
                ->where('status', 'Digunakan')
                ->get();
                
            $totalBilling = 0;
            // Misal: 1 Poin = Rp. 10,- margin warung
            foreach($completedVouchers as $v) {
                // Untuk simulasi sederhana: tagihan = harga poin * 10
                $totalBilling += ($v->reward->points_cost * 10);
            }

            return [
                'id' => $partner->id,
                'store_name' => $partner->store_name,
                'owner_name' => $partner->owner_name,
                'address' => $partner->address,
                'status' => $partner->status,
                'user' => [
                    'email' => $partner->user->email,
                    'phone' => $partner->user->phone,
                ],
                'completed_transactions' => $completedVouchers->count(),
                'total_billing_estimate' => $totalBilling,
                'created_at' => $partner->created_at
            ];
        });

        return response()->json(['data' => $partners]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|unique:users,phone',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6'
        ]);

        DB::beginTransaction();
        try {
            // 1. Create User dengan role mitra
            $user = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'mitra'
            ]);

            // 2. Create Warung Partner profile
            $partner = WarungPartner::create([
                'user_id' => $user->id,
                'store_name' => $validated['store_name'],
                'owner_name' => $validated['owner_name'],
                'address' => $validated['address'],
                'status' => 'active'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Mitra Warung berhasil ditambahkan & Akun dibuat',
                'data' => $partner
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat mitra warung: ' . $e->getMessage()], 500);
        }
    }
}
