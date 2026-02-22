<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;

class WithdrawalRequestController extends Controller
{
    public function index()
    {
        $requests = WithdrawalRequest::with('user:id,name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function approve($id)
    {
        $request = WithdrawalRequest::findOrFail($id);

        if ($request->status !== 'Menunggu') {
            return response()->json(['message' => 'Permintaan sudah diproses'], 422);
        }

        // Deduct points from user
        $user = $request->user;
        if ($user->eco_points < $request->points) {
            return response()->json(['message' => 'Poin pengguna tidak mencukupi'], 422);
        }

        $user->decrement('eco_points', $request->points);
        $request->update(['status' => 'Disetujui']);

        return response()->json([
            'message' => 'Pencairan disetujui',
            'data' => $request,
        ]);
    }

    public function reject($id)
    {
        $request = WithdrawalRequest::findOrFail($id);

        if ($request->status !== 'Menunggu') {
            return response()->json(['message' => 'Permintaan sudah diproses'], 422);
        }

        $request->update(['status' => 'Ditolak']);

        return response()->json([
            'message' => 'Pencairan ditolak',
            'data' => $request,
        ]);
    }
}
