<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Reward;
use App\Models\Voucher;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RewardController extends Controller
{
    /**
     * Get all active rewards (store catalog)
     */
    public function index()
    {
        $rewards = Reward::where('is_active', true)->get();
        return response()->json(['data' => $rewards]);
    }

    /**
     * Redeem a reward using user's eco_points
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'reward_id' => 'required|exists:rewards,id'
        ]);

        $user = $request->user();
        $reward = Reward::findOrFail($request->reward_id);

        if (!$reward->is_active || $reward->stock <= 0) {
            return response()->json(['message' => 'Hadiah tidak tersedia atau stok habis.'], 400);
        }

        if ($user->eco_points < $reward->points_cost) {
            return response()->json(['message' => 'Poin Anda tidak mencukupi.'], 400);
        }

        try {
            DB::beginTransaction();

            // Deduct points
            $user->eco_points -= $reward->points_cost;
            $user->save();

            // Deduct stock
            $reward->stock -= 1;
            $reward->save();

            // Generate unique voucher code
            $token = strtoupper(Str::random(10));

            // Create voucher
            $voucher = Voucher::create([
                'user_id' => $user->id,
                'reward_id' => $reward->id,
                'qr_code_token' => $token,
                'status' => 'Aktif',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Berhasil ditukar! Silakan cek menu Voucherku.',
                'data' => $voucher->load('reward'),
                'new_balance' => $user->eco_points
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

    /**
     * Get user's vouchers
     */
    public function myVouchers(Request $request)
    {
        $vouchers = Voucher::with('reward')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $vouchers]);
    }
}
