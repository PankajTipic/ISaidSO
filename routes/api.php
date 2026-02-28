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
use App\Http\Controllers\AdminController;




Route::apiResource('fields', FieldController::class)->only(['index', 'show']);
Route::apiResource('answer-types', AnswerTypeController::class)->only(['index', 'show']);
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
    Route::get('/profile', [AuthController::class , 'profile']);
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::post('/refresh', [AuthController::class , 'refresh']); // Refresh needs auth token logic
    Route::get('/user', [AuthController::class , 'user']);
    Route::post('/profile/update', [AuthController::class , 'updateProfile']);


    // Add all other protected API routes here

    Route::apiResource('groups', GroupController::class);
    Route::post('/groups/{group}/join', [GroupController::class , 'join']);
    Route::get('/groups/{group}/questions', [GroupController::class , 'questions']);
    Route::apiResource('questions', QuestionController::class);
    Route::get('/my-questions', [QuestionController::class , 'questionsByUserId']);

    Route::apiResource('fields', FieldController::class)->except(['index', 'show']);
    Route::apiResource('answer-types', AnswerTypeController::class)->except(['index', 'show']);
    Route::apiResource('points', PointController::class);
    Route::apiResource('answers', AnswerController::class);

    // Poll Module Routes
    Route::apiResource('polls', \App\Http\Controllers\PollController::class)->only(['index', 'show', 'store']);
    Route::post('/polls/{id}/vote', [\App\Http\Controllers\PollController::class , 'vote']);
    Route::patch('/polls/{id}/verify', [\App\Http\Controllers\PollController::class , 'verify']);

    // Prediction Module Routes
    Route::apiResource('predictions', \App\Http\Controllers\PredictionController::class)->only(['index', 'show', 'store']);
    Route::patch('/predictions/{id}/verify', [\App\Http\Controllers\PredictionController::class , 'verify']);

    // Leaderboard
    Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class , 'index']);
    Route::get('/leaderboard/my-standing', [\App\Http\Controllers\LeaderboardController::class , 'myStanding']); 

       Route::post('/groups/{group}/leave', [GroupController::class, 'leave']);


        });

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class , 'stats']);
            Route::get('/users', [AdminController::class , 'users']);
            Route::post('/users/{id}/block', [AdminController::class , 'toggleBlock']);
            Route::get('/predictions', [AdminController::class , 'predictions']);
            Route::get('/polls', [AdminController::class , 'polls']);
            Route::get('/groups', [AdminController::class , 'groups']);
            Route::get('/groups/{id}', [AdminController::class , 'groupDetails']);


           

    Route::post('/groups/{id}/block', [AdminController::class, 'toggleGroupBlock']);
    Route::get('/leaderboard', [AdminController::class, 'leaderboard']);
    Route::get('/answers', [AdminController::class, 'answers']);
    Route::get('/groups/{id}/leave', [AdminController::class, 'leaveGroup'])->name('groups.leave');
    Route::get('/groups/{id}', [AdminController::class, 'groupDetails']);
    Route::get('/questions/{id}', [AdminController::class, 'questionDetails']);
 

        }
        );   
