<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use App\Models\User;

class FollowController extends Controller
{
    public function toggleFollow($userId)
    {
        $userToFollow = User::findOrFail($userId);
        $me = Auth::user();

        if ($me->id == $userToFollow->id) {
            return response()->json(['error' => 'You cannot follow yourself'], 400);
        }

        if ($me->following()->where('following_id', $userId)->exists()) {
            $me->following()->detach($userId);
            return response()->json(['message' => 'Unfollowed successfully', 'following' => false]);
        } else {
            $me->following()->attach($userId);
            return response()->json(['message' => 'Followed successfully', 'following' => true]);
        }
    }

    public function getFollowing()
    {
        $followingIds = Auth::user()->following()->pluck('following_id');
        return response()->json(['following_ids' => $followingIds]);
    }
}
