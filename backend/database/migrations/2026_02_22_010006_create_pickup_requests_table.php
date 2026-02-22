<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('address');
            $table->string('waste_description');
            $table->string('estimated_weight')->nullable();
            $table->foreignId('courier_id')->nullable()->constrained()->onDelete('set null');
            $table->string('status')->default('Menunggu'); // Menunggu, Ditugaskan, Dijemput, Selesai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_requests');
    }
};
