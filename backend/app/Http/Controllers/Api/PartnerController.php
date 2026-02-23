<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PartnerController extends Controller
{
    /**
     * Get Mitra Stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'mitra') {
            return response()->json(['message' => 'Unauthorized. Only Mitra can access.'], 403);
        }

        // Dummy stats for now, later could be linked to actual claims
        return response()->json([
            'data' => [
                'vouchers_claimed_today' => rand(5, 20),
                'vouchers_claimed_month' => rand(50, 150),
                'total_revenue_from_vouchers' => rand(100000, 500000)
            ]
        ]);
    }

    /**
     * Validate Voucher QR Code
     */
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string'
        ]);

        $tokenStr = str_replace('lumbunghijau:voucher:', '', $request->qr_token);
        
        $voucher = Voucher::with(['user', 'reward'])
            ->where('qr_code_token', $tokenStr)
            ->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher tidak ditemukan atau QR tidak valid.'], 404);
        }

        if ($voucher->status !== 'Aktif') {
            return response()->json([
                'message' => "Voucher sudah {$voucher->status} pada " . ($voucher->used_at ? $voucher->used_at->format('d M Y, H:i') : '')
            ], 400);
        }

        return response()->json([
            'data' => [
                'voucher_id' => $voucher->id,
                'reward_name' => $voucher->reward->name,
                'reward_image' => $voucher->reward->image_url,
                'user_name' => $voucher->user->name,
                'status' => $voucher->status
            ]
        ]);
    }

    /**
     * Claim/Redeem Voucher and mark as used
     */
    public function claimVoucher(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|exists:vouchers,id'
        ]);

        $voucher = Voucher::find($request->voucher_id);

        if ($voucher->status !== 'Aktif') {
            return response()->json(['message' => "Gagal, Voucher sudah {$voucher->status}"], 400);
        }

        $voucher->status = 'Digunakan';
        $voucher->used_at = now();
        $voucher->save();

        return response()->json([
            'message' => 'Voucher berhasil diklaim!'
        ]);
    }
}
