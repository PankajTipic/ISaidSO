<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_scores', function (Blueprint $table) {
            $table->double('total_score')->default(0)->after('score');
            $table->decimal('avg_votes', 8, 2)->default(0)->after('total_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_scores', function (Blueprint $table) {
            $table->dropColumn(['total_score', 'avg_votes']);
        });
    }
};
