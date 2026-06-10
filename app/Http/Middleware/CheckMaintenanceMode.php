<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $maintenanceMode = Setting::where('key', 'maintenance_mode')->value('value');

        if ($maintenanceMode === '1') {
            $user = Auth::guard('sanctum')->user();

            // Allow admins to bypass maintenance mode so they can manage the system
            if ($user && in_array($user->role, ['admin', 'super_admin', 'system_admin'])) {
                return $next($request);
            }

            return response()->json([
                'message' => 'System is under maintenance. Please try again later.'
            ], 503);
        }

        return $next($request);
    }
}
