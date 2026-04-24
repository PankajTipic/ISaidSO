<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\GroupJoinRequest;
use App\Notifications\JoinRequestNotification;

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
        $userId = Auth::id();
        $group = Group::withCount('members')->findOrFail($id);

        $isOwner = $group->user_id === $userId;
        $isMember = $group->members()->where('user_id', $userId)->exists();

        // Load members only for members or owner
        if ($isMember || $isOwner) {
            $group->load('members:id,name,username,avatar');
        }

        $pendingRequest = null;
        if (!$isMember && !$isOwner) {
            $pendingRequest = GroupJoinRequest::where('group_id', $id)
                ->where('user_id', $userId)
                ->where('status', 'pending')
                ->first();
        }

        return response()->json([
            'id' => $group->id,
            'name' => $group->name,
            'description' => $group->description,
            'memberCount' => $group->members_count,
            'isPrivate' => (bool)$group->is_private,
            'isMember' => $isMember,
            'isOwner' => $isOwner,
            'pendingRequest' => $pendingRequest ? true : false,
            'createdAt' => $group->created_at->toISOString(),
            'members' => ($isMember || $isOwner) ? $group->members : [],
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
        $userId = Auth::id();
        if ($group->members()->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'Already joined'], 400);
        }

        if ($group->is_private) {
            // Check if request already exists
            $existing = GroupJoinRequest::where('group_id', $group->id)
                ->where('user_id', $userId)
                ->first();
            
            if ($existing) {
                if ($existing->status === 'pending') {
                    return response()->json(['message' => 'Join request already pending'], 400);
                }
                // If rejected, maybe allow re-requesting? For now, just update to pending.
                $existing->update(['status' => 'pending']);
            } else {
                GroupJoinRequest::create([
                    'group_id' => $group->id,
                    'user_id' => $userId,
                    'status' => 'pending'
                ]);
            }

            // Notify Owner
            $owner = $group->user;
            $requester = Auth::user();
            $owner->notify(new JoinRequestNotification($requester, $group));

            return response()->json(['message' => 'Join request sent to group owner']);
        }

        $group->members()->attach($userId);

        return response()->json(['message' => 'Successfully joined group']);
    }

    public function requests(Group $group)
    {
        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = $group->joinRequests()->with('user:id,name,username,avatar')->where('status', 'pending')->get();

        return response()->json($requests);
    }

    public function handleRequest(Request $request, Group $group, $requestId)
    {
        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $joinRequest = GroupJoinRequest::where('group_id', $group->id)->findOrFail($requestId);
        
        $validated = $request->validate([
            'action' => 'required|in:accept,reject'
        ]);

        if ($validated['action'] === 'accept') {
            $joinRequest->update(['status' => 'accepted']);
            // Add user to group
            if (!$group->members()->where('user_id', $joinRequest->user_id)->exists()) {
                $group->members()->attach($joinRequest->user_id);
            }
            return response()->json(['message' => 'Request accepted and user added to group']);
        } else {
            $joinRequest->update(['status' => 'rejected']);
            return response()->json(['message' => 'Request rejected']);
        }
    }

    public function addMember(Request $request, Group $group)
    {
        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'username' => 'required|string|exists:users,username'
        ]);

        $user = User::where('username', $validated['username'])->firstOrFail();

        if ($group->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User is already a member'], 400);
        }

        $group->members()->attach($user->id);

        return response()->json(['message' => 'User added successfully', 'user' => $user]);
    }

    public function removeMember(Request $request, Group $group, $userId)
    {
        if ($group->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($userId == $group->user_id) {
            return response()->json(['message' => 'Cannot remove yourself (the owner)'], 400);
        }

        $group->members()->detach($userId);

        return response()->json(['message' => 'Member removed successfully']);
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