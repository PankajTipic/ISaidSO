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
    public function toggleBlock($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'You cannot block yourself.'], 400);
        }

        $user->is_blocked = !$user->is_blocked;
        $user->save();

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

    /**
     * List all groups.
     */
    // public function groups()
    // {
    //     $groups = Group::with(['user'])
    //         ->withCount('members')
    //         ->latest()
    //         ->paginate(15);
    //     return response()->json($groups);
    // }

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

    /**
     * Get details of a group including members.
     */
    // public function groupDetails($id)
    // {
    //     $group = Group::with(['user', 'members'])->withCount('members')->findOrFail($id);
    //     return response()->json($group);
    // }


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

    // Detailed group view (members + questions + answers summary)
    // public function groupDetails($id)
    // {
    //     $group = Group::with([
    //         'user',
    //         'members' => fn($q) => $q->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.role'),
    //         'questions' => fn($q) => $q->with(['user', 'answers' => fn($qa) => $qa->with('user')])
    //     ])
    //     ->withCount('members')
    //     ->findOrFail($id);

    //     return response()->json($group);
    // }

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
}
