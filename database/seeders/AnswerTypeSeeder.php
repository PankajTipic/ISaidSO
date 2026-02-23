<?php

// namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use Illuminate\Database\Seeder;

// class AnswerTypeSeeder extends Seeder
// {
//     /**
//      * Run the database seeds.
//      */
//     public function run(): void
//     {
//         //
//     }
// }


use App\Models\AnswerType;
use Illuminate\Database\Seeder;

class AnswerTypeSeeder extends Seeder
{
    public function run(): void
    {
        AnswerType::create(['ans_type' => 'Yes/No']);
        AnswerType::create(['ans_type' => 'Multiple Choice']);
        AnswerType::create(['ans_type' => 'Numeric']);
    }
}