<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\UserScore;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    /**
     * Display the leaderboard (Overall or filtered).
     */
    /**
     * Display the leaderboard (Overall or filtered).
     */
    // public function index(Request $request)
    // {
    //     // Trigger deferred point awarding for all questions that just ended
    //     $scoreService = new \App\Services\ScoreService();
    //     $scoreService->processPendingRewards();

    //     $query = UserScore::query();

    //     if ($request->has('category_id')) {
    //         $query->where('field_id', $request->get('category_id'));
    //     }

    //     $locationScope = $request->get('location_scope', 'global');

    //     if ($locationScope === 'country') {
    //         $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
    //         if ($country) {
    //             $query->where('country', $country);
    //         }
    //     }
    //     elseif ($locationScope === 'city') {
    //         $city = $request->get('city');
    //         if ($city) {
    //             $query->where('city', $city);
    //         }
    //     }

    //     // Aggregate scores by user
    //     $leaders = $query->select(
    //         'user_id',
    //         DB::raw('SUM(score) as total_score'),
    //         DB::raw('SUM(correct_predictions) as total_correct'),
    //         DB::raw('SUM(total_predictions) as total_attempts')
    //     )
    //         ->groupBy('user_id')
    //         ->orderBy('total_score', 'desc')
    //         ->with('user')
    //         ->take(50)
    //         ->get();

    //     // Standardize format for frontend (map total_score -> score, etc.)
    //     $formattedLeaders = $leaders->map(function ($leader, $index) {
    //         return [
    //         'id' => $leader->user_id, // Identify by user_id for list keys
    //         'user_id' => $leader->user_id,
    //         'user' => $leader->user,
    //         'score' => (int)$leader->total_score,
    //         'correct_predictions' => (int)$leader->total_correct,
    //         'total_predictions' => (int)$leader->total_attempts,
    //         'accuracy' => $leader->total_attempts > 0
    //         ? round(($leader->total_correct / $leader->total_attempts) * 100, 1)
    //         : 0,
    //         'rank' => $index + 1
    //         ];
    //     });

    //     return response()->json([
    //         'message' => 'Leaderboard fetched successfully',
    //         'data' => $formattedLeaders
    //     ]);
    // }

    // /**
    //  * Get the current logged in user's standing.
    //  */
    // public function myStanding(Request $request)
    // {
    //     $userId = $request->user()->id;

    //     $query = UserScore::where('user_id', $userId)->with(['field']);

    //     if ($request->has('category_id')) {
    //         $query->where('field_id', $request->get('category_id'));
    //     }

    //     $locationScope = $request->get('location_scope', 'global');

    //     if ($locationScope === 'country') {
    //         $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
    //         if ($country) {
    //             $query->where('country', $country);
    //         }
    //     }
    //     elseif ($locationScope === 'city') {
    //         $city = $request->get('city');
    //         if ($city) {
    //             $query->where('city', $city);
    //         }
    //     }

    //     $myScore = $query->first();

    //     if (!$myScore) {
    //         return response()->json([
    //             'message' => 'User has no prediction scores yet.',
    //             'data' => null
    //         ]);
    //     }

    //     // Calculate rank by counting users with higher scores
    //     $higherScoresQuery = UserScore::where('score', '>', $myScore->score);

    //     if ($request->has('category_id')) {
    //         $higherScoresQuery->where('field_id', $request->get('category_id'));
    //     }
    //     if ($locationScope === 'country') {
    //         $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
    //         if ($country) {
    //             $higherScoresQuery->where('country', $country);
    //         }
    //     }
    //     elseif ($locationScope === 'city') {
    //         $city = $request->get('city');
    //         if ($city) {
    //             $higherScoresQuery->where('city', $city);
    //         }
    //     }

    //     $rank = $higherScoresQuery->count() + 1;
    //     $myScore->rank = $rank;

    //     return response()->json([
    //         'message' => 'User standing fetched successfully',
    //         'data' => $myScore
    //     ]);
    // }




    /**
     * Display the leaderboard (Overall or filtered).
     */
    public function index(Request $request)
    {
        // Trigger deferred point awarding for all questions that just ended
        $scoreService = new \App\Services\ScoreService();
        $scoreService->processPendingRewards();

        $perPage = $request->input('per_page', 20);

        $query = UserScore::query()
            ->with('user:id,name,username,avatar')
            ->select(
                'user_id',
                DB::raw('SUM(score) as score'),
                DB::raw('SUM(correct_predictions) as correct_predictions'),
                DB::raw('SUM(total_predictions) as total_predictions'),
                DB::raw('ROUND(
                    CASE 
                        WHEN SUM(total_predictions) > 0 
                        THEN (SUM(correct_predictions) / SUM(total_predictions)) * 100 
                        ELSE 0 
                    END, 2) as accuracy')
            )
            ->groupBy('user_id')
            ->orderByDesc('score')
            ->orderByDesc('accuracy');

        // Optional filters (category, location, etc.)
        if ($request->has('category_id')) {
            $query->where('field_id', $request->get('category_id'));
        }

        $locationScope = $request->get('location_scope', 'global');

        if ($locationScope === 'country') {
            $country = $request->get('country') ?? ($request->user()?->country);
            if ($country) $query->where('country', $country);
        } elseif ($locationScope === 'city') {
            $city = $request->get('city');
            if ($city) $query->where('city', $city);
        }

        $scores = $query->paginate($perPage);

        return response()->json($scores);
    }

    /**
     * Get the current logged-in user's standing.
     */
    public function myStanding(Request $request)
    {
        $userId = $request->user()->id;

        $query = UserScore::where('user_id', $userId)
            ->select(
                'user_id',
                DB::raw('SUM(score) as score'),
                DB::raw('SUM(correct_predictions) as correct_predictions'),
                DB::raw('SUM(total_predictions) as total_predictions'),
                DB::raw('ROUND(
                    CASE 
                        WHEN SUM(total_predictions) > 0 
                        THEN (SUM(correct_predictions) / SUM(total_predictions)) * 100 
                        ELSE 0 
                    END, 2) as accuracy')
            )
            ->groupBy('user_id');

        // Optional filters
        if ($request->has('category_id')) {
            $query->where('field_id', $request->get('category_id'));
        }

        $locationScope = $request->get('location_scope', 'global');

        if ($locationScope === 'country') {
            $country = $request->get('country') ?? $request->user()?->country;
            if ($country) $query->where('country', $country);
        } elseif ($locationScope === 'city') {
            $city = $request->get('city');
            if ($city) $query->where('city', $city);
        }

        $myScore = $query->first();

        if (!$myScore) {
            return response()->json([
                'message' => 'User has no prediction scores yet.',
                'data' => null
            ]);
        }

        // Calculate rank (users with higher score)
        $higherScoresQuery = UserScore::where('score', '>', $myScore->score);

        if ($request->has('category_id')) {
            $higherScoresQuery->where('field_id', $request->get('category_id'));
        }

        // Apply same location filters for rank calculation
        if ($locationScope === 'country' && $country) {
            $higherScoresQuery->where('country', $country);
        } elseif ($locationScope === 'city' && $city) {
            $higherScoresQuery->where('city', $city);
        }

        $rank = $higherScoresQuery->count() + 1;

        $myScore->rank = $rank;

        return response()->json([
            'message' => 'User standing fetched successfully',
            'data' => $myScore
        ]);
    }


}
