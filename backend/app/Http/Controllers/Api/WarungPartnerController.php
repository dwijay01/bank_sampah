<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WarungPartner;
use Illuminate\Http\Request;

class WarungPartnerController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => WarungPartner::orderByDesc('created_at')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        $partner = WarungPartner::create([
            ...$validated,
            'vouchers_redeemed' => 0,
            'status' => 'Aktif',
            'join_date' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Mitra warung berhasil ditambahkan',
            'data' => $partner,
        ], 201);
    }
}
