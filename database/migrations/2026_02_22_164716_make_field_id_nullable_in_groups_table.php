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
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['field_id']);
            $table->unsignedBigInteger('field_id')->nullable()->change();
            $table->foreign('field_id')->references('id')->on('fields')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['field_id']);
            $table->unsignedBigInteger('field_id')->nullable(false)->change();
            $table->foreign('field_id')->references('id')->on('fields')->onDelete('cascade');
        });
    }
};
