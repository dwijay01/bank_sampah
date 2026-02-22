<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PickupRequest;
use App\Models\WasteType;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();

        $totalWasteToday = Transaction::whereDate('created_at', $today)->sum('weight_kg');
        $ecoPointsDistributed = Transaction::whereDate('created_at', $today)->sum('points_earned');
        $pendingPickups = PickupRequest::where('status', 'Menunggu')->count();

        // Ecological impact: 1 tree per 12.5 Kg waste
        $totalWasteAllTime = Transaction::sum('weight_kg');
        $treesEquivalent = floor($totalWasteAllTime / 12.5);

        return response()->json([
            'data' => [
                [
                    'id' => 1,
                    'label' => 'Total Sampah Hari Ini',
                    'value' => round($totalWasteToday, 1) . ' Kg',
                    'trend' => '+12%',
                    'trendDir' => 'up',
                    'icon' => 'TrendingUp',
                    'color' => 'emerald',
                ],
                [
                    'id' => 2,
                    'label' => 'Eco-Points Disalurkan',
                    'value' => number_format($ecoPointsDistributed),
                    'trend' => '+8%',
                    'trendDir' => 'up',
                    'icon' => 'Coins',
                    'color' => 'orange',
                ],
                [
                    'id' => 3,
                    'label' => 'Permintaan Jemput Tertunda',
                    'value' => (string) $pendingPickups,
                    'trend' => '-3',
                    'trendDir' => 'down',
                    'icon' => 'Truck',
                    'color' => 'orange',
                ],
                [
                    'id' => 4,
                    'label' => 'Dampak Ekologis',
                    'value' => $treesEquivalent . ' Pohon',
                    'trend' => '+2',
                    'trendDir' => 'up',
                    'icon' => 'TreePine',
                    'color' => 'emerald',
                ],
            ],
        ]);
    }

    public function depositTrend()
    {
        $days = collect();
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $kg = Transaction::whereDate('created_at', $date)->sum('weight_kg');
            $days->push([
                'day' => $dayNames[$date->dayOfWeek],
                'kg' => round($kg, 1),
            ]);
        }

        return response()->json(['data' => $days]);
    }

    public function wasteDistribution()
    {
        $colors = ['#059669', '#F97316', '#2563EB', '#8B5CF6', '#EC4899', '#14B8A6', '#EAB308', '#6366F1'];

        $total = Transaction::sum('weight_kg');

        $distribution = WasteType::select('waste_types.name')
            ->selectRaw('COALESCE(SUM(transactions.weight_kg), 0) as total_kg')
            ->leftJoin('transactions', 'waste_types.id', '=', 'transactions.waste_type_id')
            ->groupBy('waste_types.id', 'waste_types.name')
            ->orderByDesc('total_kg')
            ->get()
            ->values()
            ->map(function ($item, $idx) use ($total, $colors) {
                return [
                    'name' => $item->name,
                    'value' => $total > 0 ? round(($item->total_kg / $total) * 100, 0) : 0,
                    'fill' => $colors[$idx % count($colors)],
                ];
            });

        return response()->json(['data' => $distribution]);
    }
}
