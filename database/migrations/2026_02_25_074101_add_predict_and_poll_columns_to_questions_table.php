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
            $table->string('module_type')->default('question')->after('visibility');
            $table->text('description')->nullable()->after('questions');
            $table->string('location_scope')->nullable()->after('end_date'); // global, country, city
            $table->string('status')->nullable()->after('location_scope'); // active, locked, closed
            $table->string('result')->nullable()->after('status'); // pass, fail
            $table->boolean('subscription_required')->default(false)->after('result');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['module_type', 'description', 'location_scope', 'status', 'result', 'subscription_required']);
        });
    }
};
