<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RtRwGroup;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index()
    {
        $groups = RtRwGroup::orderByDesc('total_kg')->get()
            ->values()
            ->map(function ($group, $idx) {
                $group->rank = $idx + 1;
                return $group;
            });

        return response()->json(['data' => $groups]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'members_count' => 'nullable|integer|min:0',
        ]);

        $group = RtRwGroup::create([
            'name' => $validated['name'],
            'total_kg' => 0,
            'total_points' => 0,
            'members_count' => $validated['members_count'] ?? 0,
        ]);

        return response()->json([
            'message' => 'RT/RW berhasil ditambahkan',
            'data' => $group,
        ], 201);
    }
}
