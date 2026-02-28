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
        Schema::create('user_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('field_id')->nullable()->constrained('fields')->onDelete('cascade'); // category
            $table->string('location_scope')->nullable(); // city, country, global
            $table->integer('correct_predictions')->default(0);
            $table->integer('total_predictions')->default(0);
            $table->decimal('accuracy', 5, 2)->default(0); // percentage 100.00
            $table->integer('score')->default(0);
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_scores');
    }
};
