<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Answer;
use App\Models\UserScore;
use App\Models\User;
use App\Models\Point;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScoreService
{
    /**
     * Process all questions that have ended and haven't had rewards distributed yet.
     */
    // public function processPendingRewards()
    // {
    //     $now = Carbon::now();

    //     // Find questions that have ended, aren't closed yet, and haven't been rewarded
    //     $questions = Question::where('end_date', '<', $now)
    //         ->where('rewards_distributed', false)
    //         ->where('status', '!=', 'closed')
    //         ->get();

    //     foreach ($questions as $question) {
    //         $this->awardPoints($question);
    //     }
    // }

    public function processPendingRewards()
{
    $endedPredictions = \App\Models\Question::where('module_type', 'prediction')
        ->where('status', 'active')
        ->where('end_date', '<', now())
        ->where('rewards_distributed', false)
        ->get();

    foreach ($endedPredictions as $prediction) {
        $prediction->rewards_distributed = true;
        $prediction->save();

        $correctAnswer = $prediction->correct_answer;

        // Get all correct answers for this prediction
        $correctAnswers = $prediction->answers()
            ->where('answer', $correctAnswer)
            ->get();

        foreach ($correctAnswers as $answer) {
            // FIXED: pass $answer->user_id (integer), not $prediction object
            $this->awardPoints(
                $answer->user_id,           // ← correct: user ID (int)
                $prediction->field_id,      // field/category
                true,                       // isCorrect
                10                          // points (adjust as needed)
            );
        }
    }
}

    /**
     * Award points to all users who answered a specific question correctly.
     */
    // public function awardPoints(Question $question)
    // {
    //     if ($question->rewards_distributed) {
    //         return;
    //     }

    //     $correctAnswer = $question->correct_answer;

    //     // Skip if no correct answer is defined (e.g. results not yet verified for custom questions)
    //     // But for predictions/polls it's usually set or "N/A"
    //     if (!$correctAnswer || $correctAnswer === 'N/A') {
    //         return;
    //     }

    //     // Get all unique users who answered this question
    //     $answers = Answer::where('question_id', $question->id)->get();

    //     foreach ($answers as $answer) {
    //         $this->updateUserScore($answer, $question);
    //     }

    //     // Mark as distributed
    //     $question->update(['rewards_distributed' => true]);
    // }

    public function awardPoints(int $userId, ?int $fieldId, bool $isCorrect, int $points = 10)
    {
        // Find or create the score record for this user + field
        $score = UserScore::firstOrCreate(
            [
                'user_id' => $userId,
                'field_id' => $fieldId,
            ],
            [
                'total_predictions' => 0,
                'correct_predictions' => 0,
                'score' => 0,
                'accuracy' => 0.00,
                'location_scope' => 'global', // or 'country'/'city' if needed
                'country' => null,
                'city' => null,
            ]
        );

        // Increment total predictions
        $score->total_predictions += 1;

        // Award points and correct prediction if correct
        if ($isCorrect) {
            $score->correct_predictions += 1;
            $score->score += $points;
        }

        // Calculate and cap accuracy (safe range: 0–100)
        if ($score->total_predictions > 0) {
            $rawAccuracy = ($score->correct_predictions / $score->total_predictions) * 100;
            $score->accuracy = round(min(100, max(0, $rawAccuracy)), 2);
        } else {
            $score->accuracy = 0.00;
        }

        // Save safely — this line should now never throw "out of range"
        $score->save();
    }

    /**
     * Update an individual user's score based on their answer.
     */
    protected function updateUserScore(Answer $answer, Question $question)
    {
        $userId = $answer->user_id;
        $user = User::find($userId);

        if (!$user)
            return;

        $userScore = UserScore::firstOrCreate(
        ['user_id' => $userId, 'field_id' => $question->field_id],
        [
            'location_scope' => $question->location_scope ?? 'global',
            'country' => $user->country,
            'city' => $user->city,
            'total_predictions' => 0,
            'correct_predictions' => 0,
            'score' => 0,
        ]
        );

        // Sync location
        $userScore->country = $user->country;
        $userScore->city = $user->city;

        $isCorrect = $answer->answer === $question->correct_answer;

        if ($isCorrect) {
            $userScore->correct_predictions += 1;
            $userScore->score += 10;

            // Update legacy Point model
            Point::updateOrCreate(
            ['user_id' => $userId],
            ['points' => DB::raw('points + 10')]
            );
        }

        if ($userScore->total_predictions > 0) {
            $userScore->accuracy = ($userScore->correct_predictions / $userScore->total_predictions) * 100;
        }

        $userScore->save();
    }
}
