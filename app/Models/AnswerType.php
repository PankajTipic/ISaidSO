<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnswerType extends Model
{
    use HasFactory;

    protected $fillable = ['ans_type'];

    public function questions()
    {
        return $this->hasMany(Question::class, 'ans_type_id');
    }
}
