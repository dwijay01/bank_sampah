<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PickupRequest;
use App\Models\Courier;
use Illuminate\Http\Request;

class PickupRequestController extends Controller
{
    public function index()
    {
        $requests = PickupRequest::with(['user:id,name', 'courier:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function assign(Request $request, $id)
    {
        $validated = $request->validate([
            'courier_id' => 'required|exists:couriers,id',
        ]);

        $pickupRequest = PickupRequest::findOrFail($id);

        if ($pickupRequest->status !== 'Menunggu') {
            return response()->json(['message' => 'Permintaan sudah ditugaskan'], 422);
        }

        $pickupRequest->update([
            'courier_id' => $validated['courier_id'],
            'status' => 'Ditugaskan',
        ]);

        return response()->json([
            'message' => 'Kurir berhasil ditugaskan',
            'data' => $pickupRequest->load(['user:id,name', 'courier:id,name']),
        ]);
    }

    public function couriers()
    {
        return response()->json([
            'data' => Courier::where('is_available', true)->get(),
        ]);
    }
}
