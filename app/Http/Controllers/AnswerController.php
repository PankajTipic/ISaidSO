<?php

// namespace App\Http\Controllers;

// use App\Models\Answer;
// use App\Models\Point;
// use App\Models\Question;
// use App\Models\UserScore;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;

// class AnswerController extends Controller
// {
//     public function index()
//     {
//         return Answer::all();
//     }

//     public function show($id)
//     {
//         return Answer::findOrFail($id);
//     }









    
// //     public function store(Request $request)
// // {
// //     $validated = $request->validate([
// //         'question_id' => 'required|exists:questions,id',
// //         'user_id' => 'required|exists:users,id',
// //         'answer' => 'required|string',
// //     ]);
//     //     $question = Question::findOrFail($validated['question_id']);
// //     $ansType = $question->answerType->ans_type;






    
// //     if ($ansType === 'Yes/No') {
// //         if (!in_array(strtolower($validated['answer']), ['yes', 'no'])) {
// //             return response()->json(['error' => 'Answer must be yes or no'], 422);
// //         }
// //     } elseif ($ansType === 'Multiple Choice') {
// //         if (!in_array($validated['answer'], $question->options ?? [])) {
// //             return response()->json(['error' => 'Invalid option selected'], 422);
// //         }
// //     } elseif ($ansType === 'Numeric') {
// //         if (!is_numeric($validated['answer'])) {
// //             return response()->json(['error' => 'Answer must be a number'], 422);
// //         }
// //     }






    
// //     $answer = Answer::create($validated);






    
// //     $isCorrect = $validated['answer'] === $question->correct_answer;
//     //     if ($isCorrect) {





    
// //         Point::updateOrCreate(
// //             ['user_id' => $validated['user_id']],
// //             ['points' => \DB::raw('points + 10'), 'reason' => 'Correct answer for question ' . $question->id]
// //         );
//     //         return response()->json([
// //             'message' => 'Correct answer! +10 points added',
// //             'is_correct' => true,
// //             'answer' => $answer
// //         ]);
// //     } else {





    
// //         return response()->json([
// //             'message' => 'Wrong answer, try again!',
// //             'is_correct' => false,
// //             'answer' => $answer
// //         ], 200);
// //     }
// // }

//     public function store(Request $request)
//     {
//         $validated = $request->validate([
//             'question_id' => 'required|exists:questions,id',
//             'user_id' => 'required|exists:users,id',
//             'answer' => 'required|string',
//         ]);

//         $maxAttempts = 1; // change to 2 if one retry allowed

//         // ✅ Attempt Restriction Check
//         $attemptCount = Answer::where('user_id', $validated['user_id'])
//             ->where('question_id', $validated['question_id'])
//             ->count();

//         if ($attemptCount >= $maxAttempts) {
//             return response()->json([
//                 'message' => 'You can answer this question only once.',
//             ], 403);
//         }

//         $question = Question::findOrFail($validated['question_id']);

//         // Private Question Check
//         if ($question->visibility === 'private' && $question->user_id !== Auth::id()) {
//             $isSharedWithUser = $question->groups()
//                 ->whereHas('members', function ($q) {
//                 $q->where('user_id', Auth::id());
//             })->exists();

//             if (!$isSharedWithUser) {
//                 return response()->json(['message' => 'Unauthorized. You are not a member of a group this private question is shared with.'], 403);
//             }
//         }

//         $ansType = $question->answerType->ans_type;

//         if ($ansType === 'Yes/No') {
//             if (!in_array(strtolower($validated['answer']), ['yes', 'no'])) {
//                 return response()->json(['error' => 'Answer must be yes or no'], 422);
//             }
//         }
//         elseif ($ansType === 'Multiple Choice') {
//             if (!in_array($validated['answer'], $question->options ?? [])) {
//                 return response()->json(['error' => 'Invalid option selected'], 422);
//             }
//         }
//         elseif ($ansType === 'Numeric') {
//             if (!is_numeric($validated['answer'])) {
//                 return response()->json(['error' => 'Answer must be a number'], 422);
//             }
//         }

//         // Save Answer
//         $answer = Answer::create($validated);

//         // Update UserScore Stats (Leaderboard - Prediction Count Only)
//         $user = \App\Models\User::find($validated['user_id']);
//         $userScore = UserScore::firstOrCreate(
//         ['user_id' => $validated['user_id'], 'field_id' => $question->field_id],
//         [
//             'location_scope' => $question->location_scope ?? 'global',
//             'country' => $user->country,
//             'city' => $user->city,
//             'total_predictions' => 0,
//             'correct_predictions' => 0,
//             'score' => 0,
//         ]
//         );

//         // Sync location
//         $userScore->country = $user->country;
//         $userScore->city = $user->city;
//         $userScore->total_predictions += 1;
//         $userScore->save();

//         return response()->json([
//             'message' => 'Answer recorded successfully! Points will be awarded after the due date.',
//             'answer' => $answer
//         ], 201);
//     }





// }


















namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnswerController extends Controller
{
    /**
     * Store a newly created answer in storage.
     */
    public function index()
    {
        // Optional: Admin ke liye sab answers list karne ka method
        return Answer::with(['question', 'user'])->latest()->paginate(15);
    }

    public function show($id)
    {
        return Answer::with(['question', 'user'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer'      => 'required|string',
        ]);

        $userId = Auth::id();

        // Check if user already answered this question
        $attemptCount = Answer::where('user_id', $userId)
            ->where('question_id', $validated['question_id'])
            ->count();

        if ($attemptCount >= 1) {
            return response()->json([
                'message' => 'You have already answered this question.'
            ], 403);
        }

        $question = Question::findOrFail($validated['question_id']);

        // Private question access check
        if ($question->visibility === 'private' && $question->user_id !== $userId) {
            $isSharedWithUser = $question->groups()
                ->whereHas('members', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->exists();

            if (!$isSharedWithUser) {
                return response()->json([
                    'message' => 'Unauthorized. You do not have access to this private question.'
                ], 403);
            }
        }

        // Validate answer based on question type
        $ansType = $question->answerType->ans_type ?? null;

        if ($ansType === 'Yes/No') {
            $answerLower = strtolower($validated['answer']);
            if (!in_array($answerLower, ['yes', 'no'])) {
                return response()->json([
                    'error' => 'Answer must be "Yes" or "No".'
                ], 422);
            }
        } 
        elseif ($ansType === 'Multiple Choice') {
            $options = $question->options ?? [];
            if (!in_array($validated['answer'], $options)) {
                return response()->json([
                    'error' => 'Selected answer is not a valid option.'
                ], 422);
            }
        } 
        elseif ($ansType === 'Numeric') {
            if (!is_numeric($validated['answer'])) {
                return response()->json([
                    'error' => 'Answer must be a valid number.'
                ], 422);
            }
        }

        // Create the answer
        $answer = Answer::create([
            'question_id' => $validated['question_id'],
            'user_id'     => $userId,
            'answer'      => $validated['answer'],
        ]);

        // Update user's score statistics (attempt count only here)
        $user = \App\Models\User::find($userId);

        $userScore = UserScore::firstOrCreate(
            [
                'user_id' => $userId,
                'field_id' => $question->field_id,
            ],
            [
                'location_scope' => $question->location_scope ?? 'global',
                'country' => $user->country ?? null,
                'city'    => $user->city ?? null,
                'total_predictions' => 0,
                'correct_predictions' => 0,
                'score' => 0,
            ]
        );

        // Update location if changed
        $userScore->country = $user->country;
        $userScore->city    = $user->city;

        // Increment total attempts
        $userScore->total_predictions += 1;
        $userScore->save();

        return response()->json([
            'message' => 'Answer recorded successfully! Points will be awarded after the due date.',
            'answer'  => $answer->load('user'),
        ], 201);
    }

    // Optional: Update (if you ever allow editing answers)
    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Answer editing not allowed.'], 403);
    }

    // Optional: Delete (mostly for admin)
    public function destroy($id)
    {
        $answer = Answer::findOrFail($id);
        // Only allow admin or answer owner
        if (Auth::id() !== $answer->user_id && !Auth::user()?->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $answer->delete();
        return response()->json(['message' => 'Answer deleted']);
    }
}