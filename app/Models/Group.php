<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_private', 'user_id', 'field_id', 'is_blocked'];

    public function members()
    {
        return $this->belongsToMany(User::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class , 'group_question');
    }    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function joinRequests()
    {
        return $this->hasMany(GroupJoinRequest::class);
    }
}
