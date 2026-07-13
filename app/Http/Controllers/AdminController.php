<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Question;
use App\Models\Group; 
use App\Models\UserScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats()
    {
        return response()->json([
            'users' => User::count(),
            'predictions' => Question::where('module_type', 'prediction')->count(),
            'polls' => Question::where('module_type', 'poll')->count(),
            'groups' => Group::count(),
        ]);
    }

    /**
     * List all users.
     */
    public function users()
    {
        $users = User::latest()->paginate(20);
        return response()->json($users);
    }

    /**
     * Block/Unblock a user.
     */
    // public function toggleBlock($id)
    // {
    //     $user = User::findOrFail($id);

    //     if ($user->id === Auth::id()) {
    //         return response()->json(['message' => 'You cannot block yourself.'], 400);
    //     }

    //     $user->is_blocked = !$user->is_blocked;
    //     $user->save();

    //     return response()->json([
    //         'message' => $user->is_blocked ? 'User blocked successfully.' : 'User unblocked successfully.',
    //         'user' => $user
    //     ]);
    // }

    public function toggleBlock($id)
{
    $user = User::findOrFail($id);

    if ($user->id === Auth::id()) {
        return response()->json(['message' => 'You cannot block yourself.'], 400);
    }

    $user->is_blocked = !$user->is_blocked;
    $user->save();

    // Archive all user's questions when blocked, unarchive when unblocked
    Question::where('user_id', $user->id)
        ->update(['is_archived' => $user->is_blocked]);

    return response()->json([
        'message' => $user->is_blocked ? 'User blocked successfully.' : 'User unblocked successfully.',
        'user' => $user
    ]);
}

    /**
     * List all predictions.
     */
    public function predictions()
    {
        $predictions = Question::where('module_type', 'prediction')
            ->with(['user', 'field'])
            ->latest()
            ->paginate(15);
        return response()->json($predictions);
    }

    /**
     * List all polls.
     */
    public function polls()
    {
        $polls = Question::where('module_type', 'poll')
            ->with(['user', 'field'])
            ->latest()
            ->paginate(15);
        return response()->json($polls);
    }

   

    public function groups()
{
    $groups = Group::with(['user'])
        ->withCount('members')
        ->latest()
        ->paginate(15);

    // Add is_member flag for current authenticated user (admin)
    $userId = Auth::id();

    $groups->getCollection()->transform(function ($group) use ($userId) {
        $group->is_member = $group->members()->where('user_id', $userId)->exists();
        return $group;
    });

    return response()->json($groups);
}

public function leaveGroup($id)
{
    $group = Group::findOrFail($id);
    $user = Auth::user();

    if (!$group->members()->where('user_id', $user->id)->exists()) {
        return response()->json(['message' => 'You are not a member of this group'], 400);
    }

    $group->members()->detach($user->id);

    return response()->json(['message' => 'Successfully left the group']);
}

   

    public function toggleGroupBlock($id)
    {
        $group = Group::findOrFail($id);

        if ($group->user_id === Auth::id()) {
            return response()->json(['message' => 'You cannot block your own group.'], 400);
        }

        $group->is_blocked = !$group->is_blocked;
        $group->save();

        return response()->json([
            'message' => $group->is_blocked ? 'Group blocked successfully.' : 'Group unblocked successfully.',
            'group' => $group
        ]);
    }

   

   public function groupDetails($id)
{
    $group = Group::with([
        'members' => fn($q) => $q->select('users.id', 'users.name', 'users.username', 'users.avatar'),
        'questions' => fn($q) => $q->with(['user' => fn($q) => $q->select('id', 'name', 'username')])
            ->select('questions.id', 'questions.questions', 'questions.module_type', 'questions.user_id', 'questions.created_at')
    ])
    ->withCount('members')
    ->findOrFail($id);

    // Ensure avatar_url is included for members
    $group->members->each(function ($member) {
        $member->append('avatar_url');
    });

    return response()->json($group);
}

    // Leaderboard - top users by score (global or per field)
    public function leaderboard(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $scores = UserScore::query()
            ->with('user:id,name,username,avatar')
            ->orderByDesc('score')
            ->orderByDesc('accuracy')
            ->paginate($perPage);

        return response()->json($scores);
    }

 


    // Bonus: List all answers (paginated)
    public function answers()
    {
        $answers = Answer::with(['user', 'question'])
            ->latest()
            ->paginate(15);

        return response()->json($answers);
    }


    public function questionDetails($id)
    {
        $question = Question::with([
            'user' => fn($q) => $q->select('id', 'name', 'username', 'avatar'),
            'field' => fn($q) => $q->select('id', 'fields'),
            'answers' => fn($q) => $q->with('user:id,name,username,avatar')
        ])
        ->findOrFail($id);

        $question->answers_count = $question->answers()->count();

        return response()->json($question);
    }

    /**
     * Delete a group (Admin only).
     */
    public function deleteGroup($id)
    {
        $group = Group::findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully.']);
    }

    /**
     * Delete a question (Admin only).
     */
    public function deleteQuestion($id)
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return response()->json(['message' => 'Question deleted successfully.']);
    }


    /**
 * Archive a question (soft hide from users)
 */
public function archiveQuestion($id)
{
    $question = Question::findOrFail($id);
    $question->update(['is_archived' => true]);

    return response()->json([
        'message' => 'Question archived successfully. It is now hidden from users.'
    ]);
}

/**
 * Unarchive a question
 */
public function unarchiveQuestion($id)
{
    $question = Question::findOrFail($id);
    $question->update(['is_archived' => false]);

    return response()->json([
        'message' => 'Question unarchived successfully.'
    ]);
}


public function mostActivated()
{
    // User with most created questions
    $mostQuestionUser = User::withCount('questions')
        ->orderByDesc('questions_count')
        ->first();

    // User with most answers submitted
    $mostAnswerUser = User::withCount('answers')
        ->orderByDesc('answers_count')
        ->first();

    return response()->json([
        'most_question_creator' => [
            'user_id'         => $mostQuestionUser?->id,
            'name'            => $mostQuestionUser?->name,
            'questions_count' => $mostQuestionUser?->questions_count,
        ],
        'most_active_answerer' => [
            'user_id'      => $mostAnswerUser?->id,
            'name'         => $mostAnswerUser?->name,
            'answers_count'=> $mostAnswerUser?->answers_count,
        ]
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// GDPR: Send data breach notification to all users (Article 33 & 34)
// ─────────────────────────────────────────────────────────────────────────────
public function sendBreachNotification(Request $request)
{
    $request->validate([
        'breach_description' => 'required|string|min:20',
        'action_required'    => 'required|string|min:10',
    ]);

    $detectedAt = now()->format('d M Y, H:i') . ' UTC';
    $users      = User::whereNotNull('email_verified_at')->get();
    $count      = 0;

    foreach ($users as $user) {
        \Illuminate\Support\Facades\Mail::to($user->email)->queue(
            new \App\Mail\DataBreachNotification(
                userName:          $user->name,
                breachDescription: $request->breach_description,
                detectedAt:        $detectedAt,
                actionRequired:    $request->action_required,
            )
        );
        $count++;
    }

    \Illuminate\Support\Facades\Log::warning("GDPR Breach Notification sent to {$count} users by admin ID: " . $request->user()->id);

    return response()->json([
        'message'     => "Breach notification sent to {$count} users successfully.",
        'users_count' => $count,
    ]);
}

}

