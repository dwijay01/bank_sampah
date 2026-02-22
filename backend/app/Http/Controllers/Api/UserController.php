<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PickupRequest;
use App\Models\WasteType;
use App\Models\UserLevel;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get user profile with balance and level info
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $level = UserLevel::where('min_points', '<=', $user->eco_points)
            ->where('max_points', '>=', $user->eco_points)
            ->first();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'eco_points' => $user->eco_points,
                'role' => $user->role,
                'qr_token' => $user->qr_token,
                'level' => $level,
                'total_kg' => Transaction::where('user_id', $user->id)
                    ->where('status', 'Selesai')
                    ->sum('weight_kg'),
                'total_transactions' => Transaction::where('user_id', $user->id)->count(),
            ],
        ]);
    }

    /**
     * Get user's own transactions
     */
    public function transactions(Request $request)
    {
        $transactions = Transaction::with('wasteType:id,name')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($transactions);
    }

    /**
     * Create a pickup request from user side
     */
    public function createPickupRequest(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'waste_description' => 'required|string',
            'estimated_weight' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $pickup = PickupRequest::create([
            'user_id' => $request->user()->id,
            'address' => $request->address,
            'waste_description' => $request->waste_description,
            'estimated_weight' => $request->estimated_weight,
            'notes' => $request->notes ?? '',
            'status' => 'Menunggu',
        ]);

        return response()->json([
            'data' => $pickup->load('user:id,name'),
            'message' => 'Permintaan jemput berhasil dibuat!',
        ], 201);
    }

    /**
     * Get user's pickup requests
     */
    public function pickupRequests(Request $request)
    {
        $pickups = PickupRequest::with('courier:id,name')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pickups]);
    }

    /**
     * Create a user drop-off transaction
     */
    public function createDropoff(Request $request)
    {
        $request->validate([
            'waste_type_id' => 'required|exists:waste_types,id',
            'weight_kg' => 'required|numeric|min:0.1',
        ]);

        $wasteType = WasteType::findOrFail($request->waste_type_id);
        $points = (int)($request->weight_kg * ($wasteType->price_per_kg / 10));

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'waste_type_id' => $request->waste_type_id,
            'service_type' => 'Drop-off',
            'weight_kg' => $request->weight_kg,
            'points_earned' => $points,
            'status' => 'Selesai',
        ]);

        // Update user eco_points
        $user = $request->user();
        $user->eco_points += $points;
        $user->save();

        return response()->json([
            'data' => $transaction->load('wasteType:id,name'),
            'points_earned' => $points,
            'new_balance' => $user->eco_points,
            'message' => "Setor berhasil! +{$points} Eco-Points",
        ], 201);
    }
}
