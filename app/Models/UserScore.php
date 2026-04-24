<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'field_id',
        'location_scope',
        'correct_predictions',
        'total_predictions',
        'accuracy',
        'score',
        'total_score',
        'avg_votes',
        'city',
        'country',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }
}
