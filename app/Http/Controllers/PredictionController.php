<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PredictionController extends Controller
{
    /**
     * Display a listing of the predictions.
     */
    public function index(Request $request)
    {
        $userId = Auth::guard('sanctum')->id();

        $query = Question::where('module_type', 'prediction')
            ->where(function ($q) use ($userId) {
                $q->where('visibility', 'public');
                if ($userId) {
                    $q->orWhere('user_id', $userId)
                      ->orWhereHas('groups', function ($g) use ($userId) {
                          $g->whereHas('members', function ($m) use ($userId) {
                              $m->where('user_id', $userId);
                          });
                      });
                }
            })
            ->with(['field', 'user', 'answerType'])
            ->withCount([
            'answers',
            'answers as yes_count' => function ($query) {
                $query->where('answer', 'Yes');
            },
            'answers as no_count' => function ($query) {
                $query->where('answer', 'No');
            },
            'answers as vague_count' => function ($query) {
                $query->where('answer', 'Vague');
            }
        ]);

        if ($request->has('category_id')) {
            $query->where('field_id', $request->get('category_id'));
        }
        if ($request->has('location_scope')) {
            $query->where('location_scope', $request->get('location_scope'));
        }

        return response()->json([
            'message' => 'Predictions fetched successfully',
            'data' => $query->latest()->get()
        ]);
    }

    /**
     * Store a newly created prediction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'questions' => 'required|string',
            'description' => 'nullable|string',
            'end_date' => 'required|date', // Prediction Due Date (Mandatory)
            'voting_end_date' => 'nullable|date', // Voting Due Date (Optional)
            'location_scope' => 'nullable|string|in:global,country,city',
            'ans_type_id' => 'nullable|integer',
            'visibility' => 'nullable|string|in:public,private',
            'start_date' => 'nullable|date',
            'options' => 'nullable|array',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['module_type'] = 'prediction';
        $validated['status'] = 'active';
        $validated['location_scope'] = $validated['location_scope'] ?? 'global';

        // Predictions are strictly binary (Yes/No)
        $validated['ans_type_id'] = 1;
        $validated['correct_answer'] = $validated['correct_answer'] ?? 'N/A';

        $prediction = Question::create($validated);

        // Attach to groups if group_ids are provided
        if ($request->has('group_ids')) {
            $groupIds = $request->get('group_ids', []);
            // Verify user is member of these groups (use joinedGroups, not groups - which is for ownership)
            $joinedGroupIds = Auth::user()->joinedGroups()->pluck('groups.id')->toArray();
            $validGroupIds = array_intersect($groupIds, $joinedGroupIds);

            if (!empty($validGroupIds)) {
                $prediction->groups()->attach($validGroupIds);
            }
        }

        return response()->json([
            'message' => 'Prediction created successfully',
            'data' => $prediction
        ], 201);
    }

    /**
     * Verify the outcome of a prediction.
     */
    public function verify(Request $request, $id)
    {
        $prediction = Question::where('module_type', 'prediction')->findOrFail($id);

        // Ensure it's not already closed
        if ($prediction->status === 'closed') {
            return response()->json(['error' => 'Prediction is already verified and closed.'], 400);
        }

        $validated = $request->validate([
            'result' => 'required|in:pass,fail',
        ]);

        $prediction->update([
            'result' => $validated['result'],
            'status' => 'closed',
        ]);

        // --- Majority Rule Logic ---
        // $yesVotes = \App\Models\Answer::where('question_id', $prediction->id)->where('answer', 'Yes')->count();
        // $noVotes = \App\Models\Answer::where('question_id', $prediction->id)->where('answer', 'No')->count();
        // $vagueVotes = \App\Models\Answer::where('question_id', $prediction->id)->where('answer', 'Vague')->count();

        // $correctAnswer = 'Vague'; // Default for ties or majority vague
        // if ($yesVotes > $noVotes && $yesVotes > $vagueVotes) {
        //     $correctAnswer = 'Yes';
        // } elseif ($noVotes > $yesVotes && $noVotes > $vagueVotes) {
        //     $correctAnswer = 'No';
        // }
        // // Ties (Yes==No, Yes==Vague, etc.) implicitly stay 'Vague' per requirements.

        // // Sync prediction correct_answer for record keeping
        // $prediction->update(['correct_answer' => $correctAnswer]);


        // Inside verify() method, replace the majority logic with this:

$yesVotes = Answer::where('question_id', $prediction->id)->whereRaw('LOWER(answer) = "yes"')->count();
$noVotes  = Answer::where('question_id', $prediction->id)->whereRaw('LOWER(answer) = "no"')->count();
$vagueVotes = Answer::where('question_id', $prediction->id)->whereRaw('LOWER(answer) = "vague"')->count();

$total = $yesVotes + $noVotes + $vagueVotes;

$correctAnswer = 'Vague';

if ($total > 0) {
    $yesPct = ($yesVotes / $total) * 100;
    $noPct  = ($noVotes / $total) * 100;
    $vaguePct = ($vagueVotes / $total) * 100;

    $margin = abs($yesPct - $noPct);

    if ($vaguePct > $yesPct && $vaguePct > $noPct) {
        $correctAnswer = 'Vague';
    } elseif ($margin < 10) {
        $correctAnswer = 'Vague';
    } elseif ($yesPct > $noPct) {
        $correctAnswer = 'Yes';
    } else {
        $correctAnswer = 'No';
    }
}

$prediction->update(['correct_answer' => $correctAnswer, 'status' => 'closed']);

        // Get all users who participated in this prediction
        $allVoters = \App\Models\Answer::where('question_id', $prediction->id)->get();
        $scoreService = new \App\Services\ScoreService();

        foreach ($allVoters as $vote) {
            $isCorrect = (strtolower($vote->answer) === strtolower($correctAnswer));
            
            $scoreService->awardPoints(
                $vote->user_id,
                $prediction->field_id,
                $isCorrect,
                10,
                $prediction
            );
        }

        // Handle creator bonus
        $scoreService->awardPoints(
            $prediction->user_id,
            $prediction->field_id,
            ($validated['result'] === 'pass'), // Creator gets points if result is PASS
            5,
            $prediction
        );

        return response()->json([
            'message' => 'Prediction verified successfully',
            'data' => $prediction
        ]);
    }

    /**
     * Display the specified prediction.
     */
    // public function show(string $id)
    // {
    //     $prediction = Question::where('module_type', 'prediction')
    //         ->with(['field', 'user', 'answerType', 'answers.user'])
    //         ->withCount('answers')
    //         ->findOrFail($id);

    //     if ($prediction->visibility === 'private' && $prediction->user_id !== Auth::guard('sanctum')->id()) {
    //         // Check if shared with a group user is member of
    //         $userId = Auth::guard('sanctum')->id();
    //         $isSharedWithUser = $prediction->groups()
    //             ->whereHas('members', function ($q) use ($userId) {
    //             $q->where('user_id', $userId);
    //         })->exists();

    //         if (!$isSharedWithUser) {
    //             return response()->json(['message' => 'Unauthorized. This is a private prediction.'], 403);
    //         }
    //     }

    //     return response()->json($prediction);
    // }  
    
    
    public function show(string $id)
{
    $prediction = Question::where('module_type', 'prediction')
        ->with(['field', 'user', 'answerType', 'answers.user'])
        ->withCount('answers')
        ->findOrFail($id);

    // Private question access check
    if ($prediction->visibility === 'private' && $prediction->user_id !== Auth::id()) {
        $userId = Auth::id();
        $isSharedWithUser = $prediction->groups()
            ->whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->exists();

        if (!$isSharedWithUser) {
            return response()->json(['message' => 'Unauthorized. This is a private prediction.'], 403);
        }
    }

    // ====================== AUTOMATIC RESULT CALCULATION ======================
    $isClosed = $prediction->end_date && now()->gt($prediction->end_date);

    if ($isClosed && empty($prediction->correct_answer)) {
        $yesCount = $prediction->answers->where('answer', 'Yes')->count();
        $noCount  = $prediction->answers->where('answer', 'No')->count();
        $vagueCount = $prediction->answers->where('answer', 'Vague')->count();
        $total = $yesCount + $noCount + $vagueCount;

        $correctAnswer = 'Vague';

        if ($total > 0) {
            $yesPct = ($yesCount / $total) * 100;
            $noPct  = ($noCount / $total) * 100;
            $vaguePct = ($vagueCount / $total) * 100;

            // Rule: Strong majority (60%+) or Vague dominant
            if ($vaguePct >= max($yesPct, $noPct)) {
                $correctAnswer = 'Vague';
            } elseif ($yesPct >= 60) {
                $correctAnswer = 'Yes';
            } elseif ($noPct >= 60) {
                $correctAnswer = 'No';
            } else {
                $correctAnswer = 'Vague'; // weak majority
            }
        }

        // Save the result permanently
        $prediction->update(['correct_answer' => $correctAnswer]);
    }
    // ====================== END AUTOMATIC CALCULATION ======================

    return response()->json($prediction);
}
    
    
    
    
    
    /**
     * Toggle prediction visibility between public and private.
     */
    public function toggleVisibility(Request $request, $id)
    {
        $prediction = Question::findOrFail($id);

        if ($prediction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized. Only the creator can change visibility.'], 403);
        }

        $newVisibility = $prediction->visibility === 'public' ? 'private' : 'public';
        
        $prediction->update([
            'visibility' => $newVisibility
        ]);

        // If provided, sync group IDs (especially useful when switching to private)
        if ($request->has('group_ids')) {
            $prediction->groups()->sync($request->group_ids);
        }

        return response()->json([
            'message' => "Prediction is now {$newVisibility}",
            'data' => $prediction->load('groups')
        ]);
    }
}
