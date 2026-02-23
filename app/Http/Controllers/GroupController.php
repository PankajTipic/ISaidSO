<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $query = Group::withCount('members');

        if ($request->has('my_groups')) {
            $query->whereHas('members', function ($q) {
                $q->where('user_id', Auth::id());
            });
        }

        $groups = $query->get();

        return response()->json($groups->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'memberCount' => $group->members_count,
                'isPrivate' => (bool)$group->is_private,
                'createdAt' => $group->created_at->toISOString(),
            ];
        }));
    }

    public function show($id)
    {
        return Group::withCount('members')->findOrFail($id);
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
}