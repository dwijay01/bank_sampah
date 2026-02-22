<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    protected $fillable = [
        'user_id', 'address', 'waste_description',
        'estimated_weight', 'courier_id', 'status',
        'actual_weight', 'points_earned', 'pickup_fee',
        'notes', 'completed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function courier()
    {
        return $this->belongsTo(Courier::class);
    }
}
