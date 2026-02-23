<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\UserController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\AnswerTypeController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PointController;
use App\Http\Controllers\AnswerController;




Route::apiResource('fields', FieldController::class);
Route::apiResource('answer-types', AnswerTypeController::class);
// Route::apiResource('questions', QuestionController::class);
Route::apiResource('groups', GroupController::class)->only(['index', 'show']);
Route::apiResource('points', PointController::class);
Route::apiResource('answers', AnswerController::class);

Route::middleware('auth:sanctum')->get('/profile', [AuthController::class , 'profile']);


Route::get('/public-questions', [QuestionController::class , 'publicIndex']);
Route::get('/questions/{id}/for-answer', [QuestionController::class , 'showForAnswer']);


// Public Auth Routes
Route::post('/register', [AuthController::class , 'register']);
Route::post('/login', [AuthController::class , 'login']);
Route::get('/auth/google', [AuthController::class , 'redirectToGoogle']);
Route::post('/auth/google/callback', [AuthController::class , 'handleGoogleCallback']); // POST for API callback usually
Route::get('/auth/google/callback', [AuthController::class , 'handleGoogleCallback']); // GET for browser redirect
Route::get('/auth/verify-email/{token}', [AuthController::class , 'verifyEmail']);
Route::post('/auth/forgot-password', [AuthController::class , 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class , 'resetPassword']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::post('/refresh', [AuthController::class , 'refresh']); // Refresh needs auth token logic
    Route::get('/user', [AuthController::class , 'user']);
    Route::post('/profile/update', [AuthController::class , 'updateProfile']);


    // Add all other protected API routes here

    Route::apiResource('groups', GroupController::class)->except(['index', 'show']);
    Route::post('/groups/{group}/join', [GroupController::class , 'join']);
    Route::apiResource('questions', QuestionController::class);
    Route::get('/my-questions', [QuestionController::class , 'questionsByUserId']);
});
