<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Add qr_token to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('qr_token', 64)->nullable()->unique()->after('phone');
        });

        // Generate qr_token for existing users
        $users = \App\Models\User::whereIn('role', ['warga'])->get();
        foreach ($users as $user) {
            $user->update(['qr_token' => Str::random(32)]);
        }

        // Add user_id to couriers (link courier record to user account)
        Schema::table('couriers', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('set null');
        });

        // Add completion fields to pickup_requests
        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->decimal('actual_weight', 8, 2)->nullable()->after('estimated_weight');
            $table->integer('points_earned')->default(0)->after('actual_weight');
            $table->integer('pickup_fee')->default(0)->after('points_earned');
            $table->text('notes')->nullable()->after('pickup_fee');
            $table->timestamp('completed_at')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('qr_token');
        });

        Schema::table('couriers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('pickup_requests', function (Blueprint $table) {
            $table->dropColumn(['actual_weight', 'points_earned', 'pickup_fee', 'notes', 'completed_at']);
        });
    }
};
