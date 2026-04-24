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

    public function awardPoints(int $userId, ?int $fieldId, bool $isCorrect, int $points = 10, ?Question $prediction = null)
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
                'total_score' => 0,
                'accuracy' => 0.00,
                'location_scope' => 'global',
                'country' => null,
                'city' => null,
                'avg_votes' => 0,
            ]
        );

        // Increment total predictions
        $score->total_predictions += 1;

        if ($isCorrect) {
            $score->correct_predictions += 1;
            $score->score += $points; // Legacy flat points

            // Apply new weighted scoring if prediction context is provided
            if ($prediction) {
                $weightedScore = $this->calculateWeightedScore($prediction, true);
                $score->total_score += $weightedScore;
            }
        }

        // Update accuracy
        if ($score->total_predictions > 0) {
            $rawAccuracy = ($score->correct_predictions / $score->total_predictions) * 100;
            $score->accuracy = round(min(100, max(0, $rawAccuracy)), 2);
        }

        // Update avg_votes across all predictions for this user in this field
        $score->avg_votes = $this->calculateAvgVotes($userId, $fieldId);

        $score->save();
    }

    /**
     * Calculate the weighted score for a prediction based on accuracy, confidence, engagement, and recency.
     */
    public function calculateWeightedScore(Question $prediction, bool $isCorrect): float
    {
        if (!$isCorrect) return 0;

        $truthScore = 1.0;
        $confidence = $this->getConfidenceMultiplier($prediction);
        $engagement = $this->getEngagementMultiplier($prediction);
        $timeDecay = $this->getTimeDecayMultiplier($prediction);

        return $truthScore * $confidence * $engagement * $timeDecay;
    }

    protected function getConfidenceMultiplier(Question $prediction): float
    {
        $yes = $prediction->answers()->whereRaw('LOWER(answer) = "yes"')->count();
        $no = $prediction->answers()->whereRaw('LOWER(answer) = "no"')->count();
        $vague = $prediction->answers()->whereRaw('LOWER(answer) = "vague"')->count();
        $total = $yes + $no + $vague;

        if ($total === 0) return 1.0;

        $counts = [
            'yes' => ($yes / $total) * 100,
            'no' => ($no / $total) * 100,
            'vague' => ($vague / $total) * 100
        ];

        arsort($counts);
        $values = array_values($counts);
        $winnerPct = $values[0];
        $secondPct = $values[1] ?? 0;
        $gap = $winnerPct - $secondPct;

        if ($gap >= 90) return 1.5;
        if ($gap >= 20) return 1.2;
        if ($gap >= 5)  return 1.0;
        return 0; // Too close
    }

    protected function getEngagementMultiplier(Question $prediction): float
    {
        $totalVotes = $prediction->answers()->count();
        // Formula: 1 + 0.05 * ln(1 + total_votes)
        return 1 + (0.05 * log(1 + $totalVotes));
    }

    protected function getTimeDecayMultiplier(Question $prediction): float
    {
        $ageInDays = Carbon::parse($prediction->created_at)->diffInDays(now());

        if ($ageInDays <= 7) return 1.0;
        if ($ageInDays <= 30) return 0.75;
        if ($ageInDays <= 90) return 0.50;
        return 0.25;
    }

    protected function calculateAvgVotes(int $userId, ?int $fieldId): float
    {
        // Average votes of all predictions this user participated in within this field
        $avg = Answer::where('user_id', $userId)
            ->whereHas('question', function ($q) use ($fieldId) {
                $q->where('module_type', 'prediction');
                if ($fieldId) $q->where('field_id', $fieldId);
            })
            ->with('question')
            ->get()
            ->avg(function ($answer) {
                return $answer->question->answers()->count();
            });

        return (float) ($avg ?? 0);
    }
}

