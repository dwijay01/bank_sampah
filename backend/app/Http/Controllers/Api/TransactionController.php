<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user:id,name', 'wasteType:id,name'])
            ->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate($request->get('per_page', 20));

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'waste_type_id' => 'required|exists:waste_types,id',
            'service_type' => 'required|in:Drop-off,Jemput',
            'weight_kg' => 'required|numeric|min:0.1',
        ]);

        // Calculate points: weight * 100
        $validated['points_earned'] = round($validated['weight_kg'] * 100);
        $validated['status'] = 'Menunggu';

        $transaction = Transaction::create($validated);

        // Update user eco_points
        $transaction->user->increment('eco_points', $validated['points_earned']);

        return response()->json([
            'message' => 'Transaksi berhasil dibuat',
            'data' => $transaction->load(['user:id,name', 'wasteType:id,name']),
        ], 201);
    }

    public function process($id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'Menunggu') {
            return response()->json(['message' => 'Transaksi sudah diproses'], 422);
        }

        $transaction->update(['status' => 'Selesai']);

        return response()->json([
            'message' => 'Transaksi berhasil diproses',
            'data' => $transaction,
        ]);
    }
}
