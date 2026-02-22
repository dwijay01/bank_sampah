<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use App\Models\PickupRequest;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WasteType;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CourierController extends Controller
{
    /**
     * GET /api/courier/assignments
     * Daftar pickup yang ditugaskan ke kurir ini
     */
    public function assignments(Request $request)
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun kurir tidak ditemukan'], 404);
        }

        $assignments = PickupRequest::with(['user:id,name,phone,address,qr_token'])
            ->where('courier_id', $courier->id)
            ->whereIn('status', ['Ditugaskan', 'Dijemput', 'Selesai'])
            ->orderByRaw("CASE
                WHEN status = 'Ditugaskan' THEN 1
                WHEN status = 'Dijemput' THEN 2
                WHEN status = 'Selesai' THEN 3
                ELSE 4
            END")
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $assignments]);
    }

    /**
     * POST /api/courier/validate-qr
     * Validasi QR warga cocok dengan penugasan
     */
    public function validateQr(Request $request)
    {
        $request->validate([
            'qr_token' => 'required|string',
            'pickup_id' => 'required|integer',
        ]);

        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun kurir tidak ditemukan'], 404);
        }

        // Find the pickup request
        $pickup = PickupRequest::where('id', $request->pickup_id)
            ->where('courier_id', $courier->id)
            ->where('status', 'Ditugaskan')
            ->first();

        if (!$pickup) {
            return response()->json([
                'valid' => false,
                'message' => 'Penugasan tidak ditemukan atau sudah diproses',
            ], 404);
        }

        // Validate QR token matches the warga
        $warga = User::where('id', $pickup->user_id)
            ->where('qr_token', $request->qr_token)
            ->first();

        if (!$warga) {
            return response()->json([
                'valid' => false,
                'message' => 'QR Code tidak cocok dengan warga dalam penugasan ini',
            ], 422);
        }

        // Update status to Dijemput (being picked up)
        $pickup->update(['status' => 'Dijemput']);

        return response()->json([
            'valid' => true,
            'message' => 'QR Valid! Formulir input berat terbuka.',
            'data' => [
                'pickup_id' => $pickup->id,
                'warga_name' => $warga->name,
                'waste_description' => $pickup->waste_description,
                'estimated_weight' => $pickup->estimated_weight,
                'address' => $pickup->address,
            ],
        ]);
    }

    /**
     * POST /api/courier/complete-pickup
     * Submit berat, hitung poin, selesaikan pickup
     */
    public function completePickup(Request $request)
    {
        $request->validate([
            'pickup_id' => 'required|integer',
            'waste_type_id' => 'required|exists:waste_types,id',
            'weight_kg' => 'required|numeric|min:0.1',
        ]);

        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun kurir tidak ditemukan'], 404);
        }

        $pickup = PickupRequest::where('id', $request->pickup_id)
            ->where('courier_id', $courier->id)
            ->where('status', 'Dijemput')
            ->first();

        if (!$pickup) {
            return response()->json([
                'message' => 'Penugasan tidak ditemukan. Pastikan sudah scan QR terlebih dahulu.',
            ], 404);
        }

        $wasteType = WasteType::findOrFail($request->waste_type_id);
        $weightKg = $request->weight_kg;

        // Calculate points
        $totalPoints = (int) round($weightKg * ($wasteType->price_per_kg / 10));
        $pickupFee = max(50, (int) round($totalPoints * 0.10));  // 10% fee, min 50
        $netPoints = $totalPoints - $pickupFee;

        // Create transaction for warga
        $transaction = Transaction::create([
            'user_id' => $pickup->user_id,
            'waste_type_id' => $request->waste_type_id,
            'service_type' => 'Jemput',
            'weight_kg' => $weightKg,
            'points_earned' => $netPoints,
            'status' => 'Selesai',
        ]);

        // Update warga eco_points
        $warga = User::findOrFail($pickup->user_id);
        $warga->increment('eco_points', $netPoints);

        // Complete pickup request
        $pickup->update([
            'actual_weight' => $weightKg,
            'points_earned' => $totalPoints,
            'pickup_fee' => $pickupFee,
            'status' => 'Selesai',
            'completed_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Penjemputan selesai! Poin sudah dikirim ke warga.',
            'data' => [
                'warga_name' => $warga->name,
                'waste_type' => $wasteType->name,
                'weight_kg' => $weightKg,
                'total_points' => $totalPoints,
                'pickup_fee' => $pickupFee,
                'net_points' => $netPoints,
                'warga_new_balance' => $warga->eco_points,
            ],
        ]);
    }

    /**
     * GET /api/courier/stats
     * Statistik kurir
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $courier = Courier::where('user_id', $user->id)->first();

        if (!$courier) {
            return response()->json(['message' => 'Akun kurir tidak ditemukan'], 404);
        }

        $allPickups = PickupRequest::where('courier_id', $courier->id);
        $todayPickups = PickupRequest::where('courier_id', $courier->id)
            ->whereDate('completed_at', Carbon::today());

        return response()->json([
            'data' => [
                'courier_name' => $courier->name,
                'total_completed' => (clone $allPickups)->where('status', 'Selesai')->count(),
                'total_kg' => (clone $allPickups)->where('status', 'Selesai')->sum('actual_weight'),
                'today_completed' => (clone $todayPickups)->where('status', 'Selesai')->count(),
                'today_kg' => (clone $todayPickups)->where('status', 'Selesai')->sum('actual_weight'),
                'pending_assignments' => (clone $allPickups)->whereIn('status', ['Ditugaskan', 'Dijemput'])->count(),
            ],
        ]);
    }
}
