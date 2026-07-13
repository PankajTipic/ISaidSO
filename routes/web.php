<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;
 
Route::get('/apple-test', function () {
    return Socialite::driver('apple')->redirect();
});

Route::get('/auth/apple/redirect', [AppleController::class, 'redirect']);
Route::get('/auth/apple/callback', [AppleController::class, 'callback']);

Route::view('/{any}', 'welcome')->where('any', '.*');
