<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Question;
use App\Models\Answer;
use App\Models\UserScore;
use Illuminate\Support\Facades\Auth;

class PollController extends Controller
{
    /**
     * Display a listing of polls.
     */
    public function index()
    {
        $userId = Auth::guard('sanctum')->id();

        $polls = Question::where('module_type', 'poll')
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
            ->withCount('answers') // Count total votes
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Polls fetched successfully',
            'data' => $polls
        ]);
    }

    /**
     * Store a newly created poll.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'questions' => 'required|string', // The poll question
            'options' => 'required|array|min:2|max:6', // The poll options
            'end_date' => 'required|date', // Mandatory due date
            'correct_answer' => 'nullable|string', // Correct answer for rewards
            'visibility' => 'nullable|string|in:public,private',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['module_type'] = 'poll';
        $validated['subscription_required'] = true;
        $validated['status'] = 'active';
        $validated['visibility'] = $validated['visibility'] ?? 'public';

        // Defaults for unused columns
        $validated['ans_type_id'] = 2; // Multiple choice type
        $validated['correct_answer'] = $validated['correct_answer'] ?? 'N/A';

        $poll = Question::create($validated);

        // Attach to groups if group_ids are provided
        if ($request->has('group_ids')) {
            $groupIds = $request->get('group_ids', []);
            // Verify user is member of these groups
            $joinedGroupIds = Auth::user()->joinedGroups()->pluck('groups.id')->toArray();
            $validGroupIds = array_intersect($groupIds, $joinedGroupIds);

            if (!empty($validGroupIds)) {
                $poll->groups()->attach($validGroupIds);
            }
        }

        return response()->json([
            'message' => 'Poll created successfully',
            'data' => $poll
        ], 201);
    }

    /**
     * Display the specified poll.
     */
    public function show(string $id)
    {
        $poll = Question::where('module_type', 'poll')
            ->with(['field', 'user', 'answerType', 'answers.user'])
            ->withCount('answers')
            ->findOrFail($id);

        if ($poll->visibility === 'private' && $poll->user_id !== Auth::guard('sanctum')->id()) {
            $userId = Auth::guard('sanctum')->id();
            $isSharedWithUser = $poll->groups()
                ->whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->exists();

            if (!$isSharedWithUser) {
                return response()->json(['message' => 'Unauthorized. This is a private poll.'], 403);
            }
        }

        return response()->json($poll);
    }

    /**
     * Vote on a poll.
     */
    public function vote(Request $request, $id)
    {
        $poll = Question::where('module_type', 'poll')
            ->where('status', 'active')
            ->findOrFail($id);

        // Check if poll has ended
        if ($poll->end_date && new \DateTime($poll->end_date) < new \DateTime()) {
            return response()->json(['error' => 'This poll has ended.'], 403);
        }

        $validated = $request->validate([
            'answer' => 'required|string', // The selected option text
        ]);

        // Validate the option exists
        $options = $poll->options ?? [];
        if (!in_array($validated['answer'], $options)) {
            return response()->json(['error' => 'Invalid option selected.'], 422);
        }

        $userId = Auth::id();

        if ($poll->visibility === 'private' && $poll->user_id !== $userId) {
            $isSharedWithUser = $poll->groups()
                ->whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->exists();

            if (!$isSharedWithUser) {
                return response()->json(['message' => 'Unauthorized. You are not a member of a group this private poll is shared with.'], 403);
            }
        }

        // Check if user already voted
        $existingVote = Answer::where('question_id', $poll->id)
            ->where('user_id', $userId)
            ->first();

        if ($existingVote) {
            return response()->json(['error' => 'You have already voted on this poll.'], 403);
        }

        $answer = Answer::create([
            'question_id' => $poll->id,
            'user_id' => $userId,
            'answer' => $validated['answer'],
        ]);

        // Increment total predictions for voter immediately
        $user = \App\Models\User::find($userId);
        $userScore = UserScore::firstOrCreate(
        ['user_id' => $userId, 'field_id' => $poll->field_id],
        [
            'location_scope' => $poll->location_scope ?? 'global',
            'country' => $user->country,
            'city' => $user->city,
            'total_predictions' => 0,
            'correct_predictions' => 0,
            'score' => 0,
        ]
        );
        $userScore->total_predictions += 1;
        $userScore->save();

        return response()->json([
            'message' => 'Vote recorded successfully! Points will be awarded after the due date.',
            'data' => $answer
        ], 201);
    }

    /**
     * Verify/Close a poll and award points.
     */
    public function verify(Request $request, $id)
    {
        $poll = Question::findOrFail($id);

        if ($poll->status === 'closed') {
            return response()->json(['error' => 'Poll is already closed.'], 400);
        }

        // If correct_answer is already in DB, use it. Otherwise take from request.
        $correctAnswer = $poll->correct_answer && $poll->correct_answer !== 'N/A'
            ? $poll->correct_answer
            : $request->get('correct_answer');

        if (!$correctAnswer) {
            return response()->json(['message' => 'Correct answer is required to verify.'], 422);
        }

        // Update poll details
        $poll->update([
            'correct_answer' => $correctAnswer,
            'status' => 'closed',
        ]);

        // Award points using ScoreService
        $scoreService = new \App\Services\ScoreService();
        $scoreService->awardPoints($poll);

        return response()->json([
            'message' => 'Poll verified and points awarded successfully',
            'data' => $poll
        ]);
    }
}
