<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'consent_given',
        'terms_version',
        'privacy_policy_version',
        'ip_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
