<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLevel extends Model
{
    protected $fillable = ['name', 'min_points', 'max_points', 'icon', 'color'];
}
