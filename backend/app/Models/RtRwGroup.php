<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RtRwGroup extends Model
{
    protected $fillable = ['name', 'total_kg', 'total_points', 'members_count'];
}
