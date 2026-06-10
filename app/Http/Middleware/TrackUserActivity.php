<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user) {
            $now = now();
            if (!$user->last_active_at || $now->diffInMinutes($user->last_active_at) >= 5) {
                // Disable timestamps so updated_at is not changed on random requests
                $user->timestamps = false;
                $user->last_active_at = $now;
                $user->save();
            }
        }

        return $next($request);
    }
}
