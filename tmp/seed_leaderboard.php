<?php

use App\Models\User;
use App\Models\UserScore;
use App\Models\Field;
use Illuminate\Support\Str;

$fieldId = Field::first()->id ?? 1;

echo "Seeding 10 demo users...\n";

for ($i = 1; $i <= 10; $i++) {
    $username = "demo_user_" . $i;
    $email = $username . "@example.com";
    
    $user = User::firstOrCreate(
        ['email' => $email],
        [
            'name' => "Demo User " . $i,
            'username' => $username,
            'password' => bcrypt('password'),
            'city' => 'Demo City',
            'country' => 'India',
        ]
    );

    // Create a score that meets criteria (10+ predictions, 5+ avg votes)
    UserScore::updateOrCreate(
        ['user_id' => $user->id, 'field_id' => $fieldId],
        [
            'total_predictions' => rand(12, 25),
            'correct_predictions' => rand(8, 12),
            'accuracy' => 0, // Will update below
            'score' => rand(100, 200),
            'total_score' => rand(150, 800) + ($i * 10), // Ensure spread for ranking
            'avg_votes' => rand(6, 15),
            'location_scope' => 'global',
            'city' => 'Demo City',
            'country' => 'India',
        ]
    );
    
    $score = UserScore::where('user_id', $user->id)->where('field_id', $fieldId)->first();
    $score->accuracy = ($score->correct_predictions / $score->total_predictions) * 100;
    $score->save();
}

echo "Done seeding. Now refreshing rankings...\n";
Artisan::call('ranks:refresh');
echo "Rankings refreshed!\n";
