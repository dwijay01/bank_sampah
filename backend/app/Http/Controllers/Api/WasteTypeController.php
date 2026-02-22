<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WasteType;
use Illuminate\Http\Request;

class WasteTypeController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => WasteType::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'price_per_kg' => 'required|integer|min:0',
        ]);

        $wasteType = WasteType::findOrFail($id);
        $wasteType->update($validated);

        return response()->json([
            'message' => 'Harga berhasil diperbarui',
            'data' => $wasteType,
        ]);
    }
}
