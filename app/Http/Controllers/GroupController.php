<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    // public function index(Request $request)
    // {
    //     $userId = Auth::id();
    //     $query = Group::withCount('members');

    //     // Check if the current user is a member
    //     $query->withExists(['members as is_member' => function ($q) use ($userId) {
    //         $q->where('user_id', $userId);
    //     }]);

    //     if ($request->has('my_groups')) {
    //         $query->whereHas('members', function ($q) use ($userId) {
    //             $q->where('user_id', $userId);
    //         });
    //     }
    //     else if ($userId) {
    //         // By default (Discover), hide already joined groups
    //         $query->whereDoesntHave('members', function ($q) use ($userId) {
    //             $q->where('user_id', $userId);
    //         });
    //     }

    //     $groups = $query->get();

    //     return response()->json($groups->map(function ($group) {
    //         return [
    //             'id' => $group->id,
    //             'name' => $group->name,
    //             'description' => $group->description,
    //             'memberCount' => $group->members_count,
    //             'isPrivate' => (bool)$group->is_private,
    //             'isMember' => (bool)$group->is_member,
    //             'createdAt' => $group->created_at->toISOString(),
    //         ];
    //     }));
    // }


    public function index(Request $request)
{
    $userId = Auth::id();
    $query = Group::withCount('members');

    // Always exclude blocked groups (important!)
    $query->where('is_blocked', false);

    // Check if the current user is a member (for isMember flag)
    $query->withExists(['members as is_member' => function ($q) use ($userId) {
        $q->where('user_id', $userId);
    }]);

    if ($request->has('my_groups')) {
        // My Groups: show only groups the user has joined (blocked ones already excluded above)
        $query->whereHas('members', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    } else if ($userId) {
        // Discover mode: hide already joined groups + exclude blocked
        $query->whereDoesntHave('members', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    $groups = $query->get();

    return response()->json($groups->map(function ($group) {
        return [
            'id'            => $group->id,
            'name'          => $group->name,
            'description'   => $group->description,
            'memberCount'   => $group->members_count,
            'isPrivate'     => (bool) $group->is_private,
            'isMember'      => (bool) $group->is_member,
            'createdAt'     => $group->created_at->toISOString(),
        ];
    }));
}


    public function show($id)
    {
        $group = Group::with(['members:id,name,username,avatar'])->withCount('members')->findOrFail($id);

        return response()->json([
            'id' => $group->id,
            'name' => $group->name,
            'description' => $group->description,
            'memberCount' => $group->members_count,
            'isPrivate' => (bool)$group->is_private,
            'isMember' => $group->members()->where('user_id', Auth::id())->exists(),
            'createdAt' => $group->created_at->toISOString(),
            'members' => $group->members,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
            'field_id' => 'nullable|exists:fields,id',
        ]);

        $validated['user_id'] = Auth::id();

        $group = Group::create($validated);

        // Automatically add creator to the group
        $group->members()->attach(Auth::id());

        return response()->json([
            'id' => $group->id,
            'name' => $group->name,
            'description' => $group->description,
            'memberCount' => 1,
            'isPrivate' => (bool)$group->is_private,
            'createdAt' => $group->created_at->toISOString(),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
        ]);

        $group->update($validated);
        return response()->json($group);
    }

    public function destroy($id)
    {
        $group = Group::findOrFail($id);

        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group->delete();
        return response()->json(['message' => 'Group deleted']);
    }

    public function join(Request $request, Group $group)
    {
        if ($group->members()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'Already joined'], 400);
        }

        if ($group->is_private) {
            return response()->json(['message' => 'Cannot join private group directly'], 403);
        }

        $group->members()->attach(Auth::id());

        return response()->json(['message' => 'Successfully joined group']);
    }

    
public function leave(Request $request, Group $group)
{
    $userId = Auth::id();

    if (!$group->members()->where('user_id', $userId)->exists()) {
        return response()->json(['message' => 'You are not a member of this group'], 400);
    }

    $group->members()->detach($userId);

    return response()->json(['message' => 'Successfully left the group']);
}

    public function questions(Group $group)
    {
        // Check if user is a member
        $isMember = $group->members()->where('user_id', Auth::id())->exists();

        if ($group->is_private && !$isMember) {
            return response()->json(['message' => 'Unauthorized. Must be a member of this private group.'], 403);
        }

        $questions = $group->questions()
            ->with(['field', 'user', 'answerType'])
            ->withCount([
            'answers',
            'answers as yes_count' => function ($query) {
            $query->where('answer', 'Yes');
        },
            'answers as no_count' => function ($query) {
            $query->where('answer', 'No');
        }
        ])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Group questions fetched successfully',
            'data' => $questions
        ]);
    }
}