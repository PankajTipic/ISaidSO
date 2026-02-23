<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('questions', function (Blueprint $table) {
        $table->foreignId('user_id')
              ->constrained()
              ->onDelete('cascade')
              ->after('id');   // or wherever you want it positioned
    });
}

public function down(): void
{
    Schema::table('questions', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
