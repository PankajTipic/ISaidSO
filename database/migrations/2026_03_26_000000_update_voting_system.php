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
        Schema::table('questions', function (Blueprint $table) {
            // Add voting_end_date (optional)
            if (!Schema::hasColumn('questions', 'voting_end_date')) {
                $table->dateTime('voting_end_date')->nullable()->after('end_date');
            }
            
            // Ensure end_date (Prediction Due Date) is mandatory in logic, 
            // but the migration can stay as it is if it's already there.
            // We'll change it to dateTime if it was just date.
            $table->dateTime('end_date')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('voting_end_date');
        });
    }
};
