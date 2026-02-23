<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

    protected $fillable = ['fields'];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }
}