<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('correct_answer')->nullable()->after('options');
            // multiple choice साठी options मधला एक value, yes/no साठी "yes"/"no", numeric साठी number as string
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('correct_answer');
        });
    }
};