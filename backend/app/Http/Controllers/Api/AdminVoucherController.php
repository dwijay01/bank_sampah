<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class AdminVoucherController extends Controller
{
    // Melihat riwayat antrean penukaran voucher
    public function index()
    {
        $vouchers = Voucher::with(['user', 'reward', 'partner.user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['data' => $vouchers]);
    }

    // Mendukung fitur Scan Voucher manual oleh Admin di Desktop/HP
    public function scan(Request $request)
    {
        $request->validate([
            'qr_code_token' => 'required|string'
        ]);

        $voucher = Voucher::with(['user', 'reward'])
            ->where('qr_code_token', $request->qr_code_token)
            ->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher tidak valid atau tidak ditemukan'], 404);
        }

        if ($voucher->status !== 'Aktif') {
            return response()->json(['message' => 'Voucher sudah digunakan atau hangus'], 400);
        }

        // Tandai selesai oleh admin (bukan oleh mitra warung tertentu)
        $voucher->status = 'Digunakan';
        $voucher->used_at = now();
        $voucher->save();

        return response()->json([
            'message' => 'Voucher berhasil diverifikasi & diklaim oleh Admin',
            'data' => [
                'user_name' => $voucher->user->name,
                'reward_name' => $voucher->reward->name,
            ]
        ]);
    }
}
