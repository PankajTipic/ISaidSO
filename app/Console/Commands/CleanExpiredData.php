<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class CleanExpiredData extends Command
{
    protected $signature   = 'gdpr:clean-expired-data';
    protected $description = 'GDPR Data Retention: Purge expired tokens, OTPs and permanently delete scheduled user accounts.';

    public function handle(): void
    {
        $this->info('Starting GDPR data retention cleanup...');

        // 1. Delete expired email verification tokens (older than 24 hours)
        $emailTokensDeleted = DB::table('email_verification_tokens')
            ->where('expires_at', '<', now())
            ->delete();
        $this->info("✓ Deleted {$emailTokensDeleted} expired email verification tokens.");

        // 2. Delete expired password reset tokens (older than 1 hour)
        $passwordTokensDeleted = DB::table('password_reset_tokens')
            ->where('created_at', '<', now()->subHour())
            ->delete();
        $this->info("✓ Deleted {$passwordTokensDeleted} expired password reset tokens.");

        // 3. Delete expired WhatsApp OTPs (older than 10 minutes)
        $otpDeleted = DB::table('whatsapp_otps')
            ->where('created_at', '<', now()->subMinutes(10))
            ->delete();
        $this->info("✓ Deleted {$otpDeleted} expired WhatsApp OTPs.");

        // 4. Permanently purge accounts past their 30-day grace period
        $usersToDelete = User::onlyTrashed()
            ->whereNotNull('data_retention_expires_at')
            ->where('data_retention_expires_at', '<', now())
            ->get();

        $purgedCount = 0;
        foreach ($usersToDelete as $user) {
            // Hard delete all related data (cascade via DB foreign keys)
            DB::table('data_deletion_requests')
                ->where('user_id', $user->id)
                ->update(['completed_at' => now(), 'updated_at' => now()]);

            // Force delete (permanent)
            $user->forceDelete();
            $purgedCount++;

            Log::info("GDPR: Permanently purged user account: {$user->email}");
        }
        $this->info("✓ Permanently purged {$purgedCount} user accounts past grace period.");

        $this->info('GDPR cleanup complete.');

        Log::info('GDPR cleanup ran successfully.', [
            'email_tokens_deleted'    => $emailTokensDeleted,
            'password_tokens_deleted' => $passwordTokensDeleted,
            'otp_deleted'             => $otpDeleted,
            'accounts_purged'         => $purgedCount,
        ]);
    }
}
