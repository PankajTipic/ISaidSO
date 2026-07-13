<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_deletion_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('email'); // Store email separately (user will be deleted)
            $table->string('ip_address')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('scheduled_purge_at')->nullable(); // 30 days later
            $table->timestamp('completed_at')->nullable();       // When hard delete done
            $table->timestamps();
        });

        // Add soft delete to users table if not present
        if (!Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes(); // adds deleted_at column
            });
        }

        // Add data_retention_expires_at to users
        if (!Schema::hasColumn('users', 'data_retention_expires_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('data_retention_expires_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('data_deletion_requests');
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            if (Schema::hasColumn('users', 'data_retention_expires_at')) {
                $table->dropColumn('data_retention_expires_at');
            }
        });
    }
};
