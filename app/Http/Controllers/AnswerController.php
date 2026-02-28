<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Point;
use App\Models\Question;
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    public function index()
    {
        return Answer::all();
    }

    public function show($id)
    {
        return Answer::findOrFail($id);
    }









    
//     public function store(Request $request)
// {
//     $validated = $request->validate([
//         'question_id' => 'required|exists:questions,id',
//         'user_id' => 'required|exists:users,id',
//         'answer' => 'required|string',
//     ]);
    //     $question = Question::findOrFail($validated['question_id']);
//     $ansType = $question->answerType->ans_type;






    
//     if ($ansType === 'Yes/No') {
//         if (!in_array(strtolower($validated['answer']), ['yes', 'no'])) {
//             return response()->json(['error' => 'Answer must be yes or no'], 422);
//         }
//     } elseif ($ansType === 'Multiple Choice') {
//         if (!in_array($validated['answer'], $question->options ?? [])) {
//             return response()->json(['error' => 'Invalid option selected'], 422);
//         }
//     } elseif ($ansType === 'Numeric') {
//         if (!is_numeric($validated['answer'])) {
//             return response()->json(['error' => 'Answer must be a number'], 422);
//         }
//     }






    
//     $answer = Answer::create($validated);






    
//     $isCorrect = $validated['answer'] === $question->correct_answer;
    //     if ($isCorrect) {





    
//         Point::updateOrCreate(
//             ['user_id' => $validated['user_id']],
//             ['points' => \DB::raw('points + 10'), 'reason' => 'Correct answer for question ' . $question->id]
//         );
    //         return response()->json([
//             'message' => 'Correct answer! +10 points added',
//             'is_correct' => true,
//             'answer' => $answer
//         ]);
//     } else {





    
//         return response()->json([
//             'message' => 'Wrong answer, try again!',
//             'is_correct' => false,
//             'answer' => $answer
//         ], 200);
//     }
// }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'user_id' => 'required|exists:users,id',
            'answer' => 'required|string',
        ]);

        $maxAttempts = 1; // change to 2 if one retry allowed

        // ✅ Attempt Restriction Check
        $attemptCount = Answer::where('user_id', $validated['user_id'])
            ->where('question_id', $validated['question_id'])
            ->count();

        if ($attemptCount >= $maxAttempts) {
            return response()->json([
                'message' => 'You can answer this question only once.',
            ], 403);
        }

        $question = Question::findOrFail($validated['question_id']);

        // Private Question Check
        if ($question->visibility === 'private' && $question->user_id !== Auth::id()) {
            $isSharedWithUser = $question->groups()
                ->whereHas('members', function ($q) {
                $q->where('user_id', Auth::id());
            })->exists();

            if (!$isSharedWithUser) {
                return response()->json(['message' => 'Unauthorized. You are not a member of a group this private question is shared with.'], 403);
            }
        }

        $ansType = $question->answerType->ans_type;

        if ($ansType === 'Yes/No') {
            if (!in_array(strtolower($validated['answer']), ['yes', 'no'])) {
                return response()->json(['error' => 'Answer must be yes or no'], 422);
            }
        }
        elseif ($ansType === 'Multiple Choice') {
            if (!in_array($validated['answer'], $question->options ?? [])) {
                return response()->json(['error' => 'Invalid option selected'], 422);
            }
        }
        elseif ($ansType === 'Numeric') {
            if (!is_numeric($validated['answer'])) {
                return response()->json(['error' => 'Answer must be a number'], 422);
            }
        }

        // Save Answer
        $answer = Answer::create($validated);

        // Update UserScore Stats (Leaderboard - Prediction Count Only)
        $user = \App\Models\User::find($validated['user_id']);
        $userScore = UserScore::firstOrCreate(
        ['user_id' => $validated['user_id'], 'field_id' => $question->field_id],
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
        $userScore->total_predictions += 1;
        $userScore->save();

        return response()->json([
            'message' => 'Answer recorded successfully! Points will be awarded after the due date.',
            'answer' => $answer
        ], 201);
    }





}