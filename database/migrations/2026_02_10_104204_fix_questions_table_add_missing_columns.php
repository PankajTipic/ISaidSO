<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            // Add only if not exists - safe to run multiple times
            if (!Schema::hasColumn('questions', 'user_id')) {
                $table->foreignId('user_id')
                      ->constrained('users')
                      ->onDelete('cascade')
                      ->after('id');
            }

            if (!Schema::hasColumn('questions', 'field_id')) {
                $table->foreignId('field_id')
                      ->constrained('fields')
                      ->onDelete('cascade')
                      ->after('user_id');
            }

            if (!Schema::hasColumn('questions', 'questions')) {
                $table->text('questions')->after('field_id');
            }

            if (!Schema::hasColumn('questions', 'ans_type_id')) {
                $table->foreignId('ans_type_id')
                      ->constrained('answer_types')
                      ->onDelete('cascade')
                      ->after('questions');
            }

            if (!Schema::hasColumn('questions', 'start_date')) {
                $table->date('start_date')->nullable()->after('ans_type_id');
            }

            if (!Schema::hasColumn('questions', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }

            if (!Schema::hasColumn('questions', 'visibility')) {
                $table->string('visibility')->default('public')->after('end_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['field_id']);
            $table->dropForeign(['ans_type_id']);

            $table->dropColumn([
                'user_id',
                'field_id',
                'questions',
                'ans_type_id',
                'start_date',
                'end_date',
                'visibility'
            ]);
        });
    }
};