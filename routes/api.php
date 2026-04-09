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




// Route::apiResource('fields', FieldController::class)->only(['index', 'show']);
// Route::apiResource('answer-types', AnswerTypeController::class)->only(['index', 'show']);
// Route::get('/public-questions', [QuestionController::class , 'publicIndex']);
// Route::get('/questions/{id}/for-answer', [QuestionController::class , 'showForAnswer']);


// // Public Auth Routes
// Route::post('/register', [AuthController::class , 'register']);
// Route::post('/login', [AuthController::class , 'login']);
// Route::get('/auth/google', [AuthController::class , 'redirectToGoogle']);
// Route::post('/auth/google/callback', [AuthController::class , 'handleGoogleCallback']); // POST for API callback usually
// Route::get('/auth/google/callback', [AuthController::class , 'handleGoogleCallback']); // GET for browser redirect
// Route::get('/auth/verify-email/{token}', [AuthController::class , 'verifyEmail']);
// Route::post('/auth/forgot-password', [AuthController::class , 'forgotPassword']);
// Route::post('/auth/reset-password', [AuthController::class , 'resetPassword']);

// // Protected Routes (Sanctum)
// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/profile', [AuthController::class , 'profile']);
//     Route::post('/logout', [AuthController::class , 'logout']);
//     Route::post('/refresh', [AuthController::class , 'refresh']); // Refresh needs auth token logic
//     Route::get('/user', [AuthController::class , 'user']);
//     Route::post('/profile/update', [AuthController::class , 'updateProfile']);

// // Route::post('/login', [AuthController::class , 'login']);

//     // Add all other protected API routes here

//     Route::apiResource('groups', GroupController::class);
//     Route::post('/groups/{group}/join', [GroupController::class , 'join']);
//     Route::get('/groups/{group}/questions', [GroupController::class , 'questions']);
//     Route::apiResource('questions', QuestionController::class);
//     Route::get('/my-questions', [QuestionController::class , 'questionsByUserId']);

//     Route::apiResource('fields', FieldController::class)->except(['index', 'show']);
//     Route::apiResource('answer-types', AnswerTypeController::class)->except(['index', 'show']);
//     Route::apiResource('points', PointController::class);
//     Route::apiResource('answers', AnswerController::class);

//     // Poll Module Routes
//     Route::apiResource('polls', \App\Http\Controllers\PollController::class)->only(['index', 'show', 'store']);
//     Route::post('/polls/{id}/vote', [\App\Http\Controllers\PollController::class , 'vote']);
//     Route::patch('/polls/{id}/verify', [\App\Http\Controllers\PollController::class , 'verify']);

//     // Prediction Module Routes
//     Route::apiResource('predictions', \App\Http\Controllers\PredictionController::class)->only(['index', 'show', 'store']);
//     Route::patch('/predictions/{id}/verify', [\App\Http\Controllers\PredictionController::class , 'verify']);

//     // Leaderboard
//     Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class , 'index']);
//     Route::get('/leaderboard/my-standing', [\App\Http\Controllers\LeaderboardController::class , 'myStanding']); 

//        Route::post('/groups/{group}/leave', [GroupController::class, 'leave']);


//         });

//     // Admin Routes
//     Route::middleware('admin')->prefix('admin')->group(function () {
//             Route::get('/stats', [AdminController::class , 'stats']);
//             Route::get('/users', [AdminController::class , 'users']);
//             Route::post('/users/{id}/block', [AdminController::class , 'toggleBlock']);
//             Route::get('/predictions', [AdminController::class , 'predictions']);
//             Route::get('/polls', [AdminController::class , 'polls']);
//             Route::get('/groups', [AdminController::class , 'groups']);
//             Route::get('/groups/{id}', [AdminController::class , 'groupDetails']);


           

//     Route::post('/groups/{id}/block', [AdminController::class, 'toggleGroupBlock']);
//     Route::get('/leaderboard', [AdminController::class, 'leaderboard']);
//     Route::get('/answers', [AdminController::class, 'answers']);
//     Route::get('/groups/{id}/leave', [AdminController::class, 'leaveGroup'])->name('groups.leave');
//     Route::get('/groups/{id}', [AdminController::class, 'groupDetails']);
//     Route::get('/questions/{id}', [AdminController::class, 'questionDetails']);
 

//         }
//         );   




// ===================== PUBLIC ROUTES (Auth nahi lagat) =====================
Route::apiResource('fields', \App\Http\Controllers\FieldController::class)->only(['index', 'show']);
Route::apiResource('answer-types', \App\Http\Controllers\AnswerTypeController::class)->only(['index', 'show']);

Route::get('/public-questions', [\App\Http\Controllers\QuestionController::class, 'publicIndex']);
Route::get('/questions/{id}/for-answer', [\App\Http\Controllers\QuestionController::class, 'showForAnswer']);

// Polls & Predictions chi PUBLIC list & details – yala auth nako (Guest Access)
Route::apiResource('polls', \App\Http\Controllers\PollController::class)->only(['index', 'show']);
Route::apiResource('predictions', \App\Http\Controllers\PredictionController::class)->only(['index', 'show']);

// Public Auth Routes
Route::post('/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::get('/auth/google', [\App\Http\Controllers\AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [\App\Http\Controllers\AuthController::class, 'handleGoogleCallback']);
Route::get('/auth/verify-email/{token}', [\App\Http\Controllers\AuthController::class, 'verifyEmail']);
Route::post('/auth/forgot-password', [\App\Http\Controllers\AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [\App\Http\Controllers\AuthController::class, 'resetPassword']);

// ===================== PROTECTED ROUTES (auth:sanctum) =====================
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', [\App\Http\Controllers\AuthController::class, 'profile']);
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('/refresh', [\App\Http\Controllers\AuthController::class, 'refresh']);
    Route::get('/user', [\App\Http\Controllers\AuthController::class, 'user']);
    Route::post('/profile/update', [\App\Http\Controllers\AuthController::class, 'updateProfile']);

    // Groups
    Route::apiResource('groups', \App\Http\Controllers\GroupController::class);
    Route::post('/groups/{group}/join', [\App\Http\Controllers\GroupController::class, 'join']);
    Route::post('/groups/{group}/leave', [\App\Http\Controllers\GroupController::class, 'leave']);
    Route::get('/groups/{group}/questions', [\App\Http\Controllers\GroupController::class, 'questions']);

    // Questions (CRUD + my questions)
    Route::apiResource('questions', \App\Http\Controllers\QuestionController::class);
    Route::get('/my-questions', [\App\Http\Controllers\QuestionController::class, 'questionsByUserId']);

    // Admin-only CRUD for fields & answer types
    Route::apiResource('fields', \App\Http\Controllers\FieldController::class)->except(['index', 'show']);
    Route::apiResource('answer-types', \App\Http\Controllers\AnswerTypeController::class)->except(['index', 'show']);

    Route::apiResource('points', \App\Http\Controllers\PointController::class);
    Route::apiResource('answers', \App\Http\Controllers\AnswerController::class);

    // Poll Module (index and show are public)
    Route::apiResource('polls', \App\Http\Controllers\PollController::class)->only(['store']);
    Route::post('/polls/{id}/vote', [\App\Http\Controllers\PollController::class, 'vote']);
    Route::patch('/polls/{id}/verify', [\App\Http\Controllers\PollController::class, 'verify']);

    // Prediction Module (index and show are public)
    Route::apiResource('predictions', \App\Http\Controllers\PredictionController::class)->only(['store']);
    Route::patch('/predictions/{id}/verify', [\App\Http\Controllers\PredictionController::class, 'verify']);
    Route::patch('/predictions/{id}/toggle-visibility', [\App\Http\Controllers\PredictionController::class, 'toggleVisibility']);

    // Leaderboard (auth required because of location filters)
    Route::get('/leaderboard', [\App\Http\Controllers\LeaderboardController::class, 'index']);
    Route::get('/leaderboard/my-standing', [\App\Http\Controllers\LeaderboardController::class, 'myStanding']);
});

// Dev Access Routes (Outside main auth but protected by its own logic)
Route::post('/dev/verify', [\App\Http\Controllers\DevAccessController::class, 'verify']);
Route::get('/dev/seed', [\App\Http\Controllers\DevAccessController::class, 'seed']);

// ===================== ADMIN ROUTES (middleware 'admin') =====================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {


    Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
    Route::post('/users/{id}/block', [\App\Http\Controllers\AdminController::class, 'toggleBlock']);

    Route::get('/predictions', [\App\Http\Controllers\AdminController::class, 'predictions']);
    Route::get('/polls', [\App\Http\Controllers\AdminController::class, 'polls']);
    Route::get('/groups', [\App\Http\Controllers\AdminController::class, 'groups']);
    Route::get('/groups/{id}', [\App\Http\Controllers\AdminController::class, 'groupDetails']);
    Route::post('/groups/{id}/block', [\App\Http\Controllers\AdminController::class, 'toggleGroupBlock']);
    Route::post('/groups/{id}/leave', [\App\Http\Controllers\AdminController::class, 'leaveGroup']); // POST kela (better practice)

    Route::get('/leaderboard', [\App\Http\Controllers\AdminController::class, 'leaderboard']);
    Route::get('/answers', [\App\Http\Controllers\AdminController::class, 'answers']);
    Route::get('/questions/{id}', [\App\Http\Controllers\AdminController::class, 'questionDetails']);
});