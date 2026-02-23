<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'field_id', 'questions', 'options', 'correct_answer', 'ans_type_id', 'start_date', 'end_date', 'visibility',
    ];

    protected $casts = [
        'options' => 'array', // JSON to array
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function answerType()
    {
        return $this->belongsTo(AnswerType::class, 'ans_type_id');
    }




public function answers()
{
    return $this->hasMany(Answer::class);
}



}
