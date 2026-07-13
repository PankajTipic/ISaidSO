<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class GdprController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // RIGHT TO ACCESS — Export all data as JSON (Article 15)
    // ─────────────────────────────────────────────────────────────────────────
    public function exportData(Request $request)
    {
        $user = $request->user();

        // Gather all user data
        $data = [
            'account' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'username'       => $user->username,
                'country'        => $user->country,
                'city'           => $user->city,
                'login_method'   => $user->login_method,
                'registered_at'  => $user->created_at,
                'last_login_at'  => $user->last_login_at,
                'email_verified' => !is_null($user->email_verified_at),
            ],
            'predictions' => $user->questions()
                ->where('module_type', 'prediction')
                ->select('id', 'questions', 'created_at', 'status', 'correct_answer')
                ->get(),
            'polls' => $user->questions()
                ->where('module_type', 'poll')
                ->select('id', 'questions', 'created_at', 'status')
                ->get(),
            'answers' => $user->answers()
                ->select('id', 'question_id', 'answer', 'created_at')
                ->get(),
            'points' => [
                'total'   => $user->total_points,
                'records' => $user->points()->select('id', 'points', 'created_at')->get(),
            ],
            'groups_created' => $user->groups()->select('id', 'name', 'created_at')->get(),
            'groups_joined'  => $user->joinedGroups()->select('groups.id', 'groups.name')->get(),
            'consent_records' => DB::table('user_consents')
                ->where('user_id', $user->id)
                ->get(),
            'exported_at' => now()->toIso8601String(),
        ];

        return response()->json([
            'message' => 'Your data export is ready.',
            'data'    => $data,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RIGHT TO ERASURE — Soft delete account (Article 17)
    // ─────────────────────────────────────────────────────────────────────────
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password. Account was not deleted.',
                'errors'  => ['password' => ['Incorrect password.']],
            ], 422);
        }

        // Log deletion request
        DB::table('data_deletion_requests')->insert([
            'user_id'             => $user->id,
            'email'               => $user->email,
            'ip_address'          => $request->ip(),
            'requested_at'        => now(),
            'scheduled_purge_at'  => now()->addDays(30),
            'created_at'          => now(),
            'updated_at'          => now(),
        ]);

        // Soft delete: mark user as deleted (30 day grace period)
        $user->update(['data_retention_expires_at' => now()->addDays(30)]);

        // Revoke all Sanctum tokens immediately
        $user->tokens()->delete();

        // Soft delete the user record
        $user->delete();

        Log::info("GDPR: User {$user->email} requested account deletion. Scheduled purge: " . now()->addDays(30));

        return response()->json([
            'message' => 'Your account has been scheduled for deletion. All data will be permanently removed within 30 days.',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANCEL DELETION — Restore soft-deleted account (within 30 days)
    // ─────────────────────────────────────────────────────────────────────────
    public function cancelDeletion(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Find soft-deleted user
        $user = User::withTrashed()->where('email', $request->email)->first();

        if (!$user || !$user->trashed()) {
            return response()->json(['message' => 'No pending deletion found for this account.'], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        // Check if still within 30-day grace period
        if ($user->data_retention_expires_at && now()->isAfter($user->data_retention_expires_at)) {
            return response()->json(['message' => 'Grace period has expired. Account cannot be restored.'], 410);
        }

        // Restore user
        $user->restore();
        $user->update(['data_retention_expires_at' => null]);

        // Cancel deletion request
        DB::table('data_deletion_requests')
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->update(['completed_at' => now(), 'updated_at' => now()]);

        Log::info("GDPR: User {$user->email} cancelled account deletion request.");

        return response()->json(['message' => 'Account deletion cancelled. Your account has been restored.']);
    }
}
