<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'login_method',
        'username',
        'country',
        'city',
        'is_profile_completed',
        'last_login_at',
        'role',
        'is_blocked',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the avatar URL.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }

        if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        try {
            // Generate a temporary URL for private S3 files (valid for 24 hours)
            return \Illuminate\Support\Facades\Storage::disk('s3')->temporaryUrl(
                $this->avatar,
                now()->addHours(24)
            );
        }
        catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_profile_completed' => 'boolean',
            'is_blocked' => 'boolean',
        ];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }


    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
    public function points()
    {
        return $this->hasMany(Point::class);
    }

    // User.php
    public function questions()
    {
        return $this->hasMany(Question::class);
    }


    public function groups()
    {
        return $this->hasMany(Group::class);
    }
    public function joinedGroups()
    {
        return $this->belongsToMany(Group::class);
    }



}
