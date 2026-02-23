<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            // फक्त नसेल तरच जोडा → सेफ आहे
            if (!Schema::hasColumn('groups', 'field_id')) {
                $table->foreignId('field_id')
                      ->constrained('fields')          // fields टेबलशी लिंक
                      ->onDelete('cascade')
                      ->after('user_id');              // user_id नंतर ठेवा (जर user_id असेल तर)
            }
        });
    }

    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['field_id']);
            $table->dropColumn('field_id');
        });
    }
};