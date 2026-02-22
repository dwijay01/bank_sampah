<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLevel;
use Illuminate\Http\Request;

class UserLevelController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => UserLevel::orderBy('min_points')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'min_points' => 'required|integer|min:0',
            'max_points' => 'required|integer|gt:min_points',
        ]);

        $level = UserLevel::findOrFail($id);
        $level->update($validated);

        return response()->json([
            'message' => 'Level berhasil diperbarui',
            'data' => $level,
        ]);
    }
}
