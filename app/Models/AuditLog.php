<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'action', 'description', 'ip_address', 'location'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Static helper to log an activity.
     */
    public static function log($userId, string $action, string $description, ?string $ip = null, ?string $location = null)
    {
        $ipAddress = $ip ?? Request::ip();

        // If location is not provided, resolve it from the user's profile
        if (!$location && $userId) {
            $user = User::find($userId);
            if ($user && $user->city && $user->country) {
                $location = "{$user->city}, {$user->country}";
            }
        }

        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => $ipAddress,
            'location' => $location ?? 'Unknown',
        ]);
    }
}
