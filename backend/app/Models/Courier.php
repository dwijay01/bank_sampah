<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    protected $fillable = ['name', 'phone', 'is_available', 'user_id'];

    protected function casts(): array
    {
        return ['is_available' => 'boolean'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pickupRequests()
    {
        return $this->hasMany(PickupRequest::class);
    }
}
