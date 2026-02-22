<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarungPartner extends Model
{
    protected $fillable = ['name', 'address', 'vouchers_redeemed', 'status', 'join_date'];

    protected function casts(): array
    {
        return ['join_date' => 'date'];
    }
}
