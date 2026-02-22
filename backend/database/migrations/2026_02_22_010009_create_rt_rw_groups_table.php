<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rt_rw_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('total_kg', 10, 2)->default(0);
            $table->integer('total_points')->default(0);
            $table->integer('members_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rt_rw_groups');
    }
};
