<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\PickupRequestController;
use App\Http\Controllers\Api\WasteTypeController;
use App\Http\Controllers\Api\WithdrawalRequestController;
use App\Http\Controllers\Api\WarungPartnerController;
use App\Http\Controllers\Api\UserLevelController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CourierController;

// ===== AUTH (PUBLIC) =====
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// ===== AUTH (PROTECTED) =====
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // ===== USER APP =====
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::get('/user/transactions', [UserController::class, 'transactions']);
    Route::post('/user/dropoff', [UserController::class, 'createDropoff']);
    Route::post('/user/pickup-request', [UserController::class, 'createPickupRequest']);
    Route::get('/user/pickup-requests', [UserController::class, 'pickupRequests']);
    Route::get('/user/leaderboard', [UserController::class, 'leaderboard']);
    Route::get('/user/eco-report', [UserController::class, 'ecoReport']);

    // ===== COURIER APP =====
    Route::get('/courier/assignments', [CourierController::class, 'assignments']);
    Route::post('/courier/validate-qr', [CourierController::class, 'validateQr']);
    Route::post('/courier/complete-pickup', [CourierController::class, 'completePickup']);
    Route::get('/courier/stats', [CourierController::class, 'stats']);
});

// ===== ADMIN: DASHBOARD =====
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/deposit-trend', [DashboardController::class, 'depositTrend']);
Route::get('/dashboard/waste-distribution', [DashboardController::class, 'wasteDistribution']);

// ===== ADMIN: TRANSACTIONS =====
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/transactions', [TransactionController::class, 'store']);
Route::patch('/transactions/{id}/process', [TransactionController::class, 'process']);

// ===== ADMIN: PICKUP REQUESTS =====
Route::get('/pickup-requests', [PickupRequestController::class, 'index']);
Route::post('/pickup-requests/{id}/assign', [PickupRequestController::class, 'assign']);
Route::get('/couriers', [PickupRequestController::class, 'couriers']);

// ===== ADMIN: WASTE TYPES (PUBLIC for user app too) =====
Route::get('/waste-types', [WasteTypeController::class, 'index']);
Route::put('/waste-types/{id}', [WasteTypeController::class, 'update']);

// ===== ADMIN: WITHDRAWAL REQUESTS =====
Route::get('/withdrawal-requests', [WithdrawalRequestController::class, 'index']);
Route::post('/withdrawal-requests/{id}/approve', [WithdrawalRequestController::class, 'approve']);
Route::post('/withdrawal-requests/{id}/reject', [WithdrawalRequestController::class, 'reject']);

// ===== ADMIN: WARUNG PARTNERS =====
Route::get('/warung-partners', [WarungPartnerController::class, 'index']);
Route::post('/warung-partners', [WarungPartnerController::class, 'store']);

// ===== ADMIN: USER LEVELS (PUBLIC for user app too) =====
Route::get('/user-levels', [UserLevelController::class, 'index']);
Route::put('/user-levels/{id}', [UserLevelController::class, 'update']);

// ===== ADMIN: LEADERBOARD =====
Route::get('/leaderboard', [LeaderboardController::class, 'index']);
Route::post('/leaderboard', [LeaderboardController::class, 'store']);
