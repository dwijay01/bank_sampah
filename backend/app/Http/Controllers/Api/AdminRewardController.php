<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminRewardController extends Controller
{
    public function index()
    {
        $rewards = Reward::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $rewards]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'points_cost' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048' // max 2MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rewards', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $reward = Reward::create($validated);

        return response()->json([
            'message' => 'Reward berhasil ditambahkan',
            'data' => $reward
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $reward = Reward::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'points_cost' => 'sometimes|integer|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rewards', 'public');
            $validated['image_url'] = '/storage/' . $path;
        }

        $reward->update($validated);

        return response()->json([
            'message' => 'Reward berhasil diupdate',
            'data' => $reward
        ]);
    }

    public function destroy($id)
    {
        $reward = Reward::findOrFail($id);
        $reward->delete();

        return response()->json(['message' => 'Reward berhasil dihapus']);
    }
}
