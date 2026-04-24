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
        $perPage = $request->input('per_page', 20);

        if ($request->has('category_id') && $request->get('category_id') != '') {
            $categoryId = $request->get('category_id');
            
            $query = \App\Models\UserScore::query()
                ->where('field_id', $categoryId)
                ->with('user');

            // Apply location filters
            $locationScope = $request->get('location_scope', 'global');
            if ($locationScope === 'country') {
                $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
                if ($country) {
                    $query->where('country', $country);
                }
            } elseif ($locationScope === 'city') {
                $city = $request->get('city');
                if ($city) {
                    $query->where('city', $city);
                }
            }

            $leaders = $query->select(
                'user_id',
                \Illuminate\Support\Facades\DB::raw('SUM(total_score) as total_score'),
                \Illuminate\Support\Facades\DB::raw('SUM(correct_predictions) as total_correct'),
                \Illuminate\Support\Facades\DB::raw('SUM(total_predictions) as total_attempts')
            )
            ->groupBy('user_id')
            ->orderBy('total_score', 'desc')
            ->take($perPage)
            ->get();

            $formatted = $leaders->map(function ($leader, $index) {
                return [
                    'user_id' => $leader->user_id,
                    'rank' => $index + 1,
                    'score' => (int) $leader->total_score,
                    'accuracy' => $leader->total_attempts > 0 ? round(($leader->total_correct / $leader->total_attempts) * 100, 2) : 0,
                    'total_predictions' => (int) $leader->total_attempts,
                    'user' => [
                        'id' => $leader->user_id,
                        'name' => $leader->user->name ?? 'Anonymous User',
                        'username' => $leader->user->username ?? null,
                        'avatar_url' => $leader->user && $leader->user->avatar ? url('storage/' . $leader->user->avatar) : null,
                    ]
                ];
            });

            return response()->json([
                'data' => $formatted,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $perPage,
                'total' => $formatted->count(),
            ]);
        }

        // Fetch from rankings table
        $rankings = \Illuminate\Support\Facades\DB::table('rankings')
            ->join('users', 'rankings.user_id', '=', 'users.id')
            ->select(
                'rankings.*',
                'users.name',
                'users.username',
                'users.avatar'
            )
            ->where('period', $request->get('period', 'all-time'))
            ->orderBy('rank')
            ->paginate($perPage);

        // Format to match expected frontend structure
        $rankings->getCollection()->transform(function ($rank) {
            return [
                'user_id' => $rank->user_id,
                'rank' => $rank->rank,
                'score' => (int) $rank->total_score,
                'accuracy' => (float) $rank->accuracy,
                'total_predictions' => (int) $rank->total_predictions,
                'user' => [
                    'id' => $rank->user_id,
                    'name' => $rank->name,
                    'username' => $rank->username,
                    'avatar_url' => $rank->avatar ? url('storage/' . $rank->avatar) : null,
                ]
            ];
        });

        return response()->json($rankings);
    }

    public function myStanding(Request $request)
    {
        $userId = $request->user()->id;

        if ($request->has('category_id') && $request->get('category_id') != '') {
            $categoryId = $request->get('category_id');
            
            $query = \App\Models\UserScore::where('user_id', $userId)->where('field_id', $categoryId);

            // Apply location filters
            $locationScope = $request->get('location_scope', 'global');
            if ($locationScope === 'country') {
                $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
                if ($country) {
                    $query->where('country', $country);
                }
            } elseif ($locationScope === 'city') {
                $city = $request->get('city');
                if ($city) {
                    $query->where('city', $city);
                }
            }

            $myScore = $query->first();

            if (!$myScore) {
                return response()->json([
                    'message' => 'User has no prediction scores in this category.',
                    'data' => [
                        'user_id' => $userId,
                        'rank' => null,
                        'score' => 0,
                        'accuracy' => 0,
                        'total_predictions' => 0,
                        'is_ranked' => false,
                    ]
                ]);
            }

            // Calculate rank by counting users with higher total_score in this category
            $higherScoresQuery = \App\Models\UserScore::where('field_id', $categoryId)
                ->where('total_score', '>', $myScore->total_score);

            if ($locationScope === 'country') {
                $country = $request->get('country') ?? ($request->user() ? $request->user()->country : null);
                if ($country) {
                    $higherScoresQuery->where('country', $country);
                }
            } elseif ($locationScope === 'city') {
                $city = $request->get('city');
                if ($city) {
                    $higherScoresQuery->where('city', $city);
                }
            }

            $rank = $higherScoresQuery->count() + 1;

            return response()->json([
                'message' => 'User standing fetched successfully',
                'data' => [
                    'user_id' => $userId,
                    'rank' => $rank,
                    'score' => (int)$myScore->total_score,
                    'accuracy' => $myScore->total_predictions > 0 ? round(($myScore->correct_predictions / $myScore->total_predictions) * 100, 2) : 0,
                    'total_predictions' => (int)$myScore->total_predictions,
                    'is_ranked' => true,
                ]
            ]);
        }

        // 1. Get current snapshot rank if it exists
        $standing = \Illuminate\Support\Facades\DB::table('rankings')
            ->where('user_id', $userId)
            ->where('period', $request->get('period', 'all-time'))
            ->first();

        // 2. Fetch live stats regardless of ranking status
        $stats = \App\Models\UserScore::where('user_id', $userId)
            ->select(
                \Illuminate\Support\Facades\DB::raw('SUM(total_score) as total_score'),
                \Illuminate\Support\Facades\DB::raw('SUM(total_predictions) as total_predictions'),
                \Illuminate\Support\Facades\DB::raw('SUM(correct_predictions) as correct_predictions')
            )
            ->first();

        $totalPredictions = (int)($stats->total_predictions ?? 0);
        $accuracy = $totalPredictions > 0 ? round(($stats->correct_predictions / $totalPredictions) * 100, 2) : 0;

        return response()->json([
            'message' => 'User standing fetched successfully',
            'data' => [
                'user_id' => $userId,
                'rank' => $standing ? (int)$standing->rank : null,
                'score' => $standing ? (int)$standing->total_score : (int)($stats->total_score ?? 0),
                'accuracy' => $standing ? (float)$standing->accuracy : (float)$accuracy,
                'total_predictions' => $totalPredictions,
                'is_ranked' => $standing ? true : false,
            ]
        ]);
    }








}
