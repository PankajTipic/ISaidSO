<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RefreshRankings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ranks:refresh';
    protected $description = 'Recalculate global rankings based on the new weighted scoring system.';

    public function handle()
    {
        $this->info('Refreshing rankings...');

        // 1. Clear existing rankings
        \Illuminate\Support\Facades\DB::table('rankings')->truncate();

        // 2. Aggregate scores for users meeting criteria
        // Minimum predictions = 10, Minimum average votes = 5
        $scores = \App\Models\UserScore::query()
            ->select(
                'user_id',
                \Illuminate\Support\Facades\DB::raw('SUM(total_score) as aggregate_total_score'),
                \Illuminate\Support\Facades\DB::raw('SUM(total_predictions) as aggregate_total_predictions'),
                \Illuminate\Support\Facades\DB::raw('AVG(avg_votes) as aggregate_avg_votes'), // Averaging the averages of their fields
                \Illuminate\Support\Facades\DB::raw('ROUND((SUM(correct_predictions) / SUM(total_predictions)) * 100, 2) as aggregate_accuracy')
            )
            ->groupBy('user_id')
            ->having('aggregate_total_predictions', '>=', 10)
            ->having('aggregate_avg_votes', '>=', 5)
            ->orderByDesc('aggregate_total_score')
            ->get();

        $rank = 1;
        $rankingData = [];

        foreach ($scores as $score) {
            $rankingData[] = [
                'user_id' => $score->user_id,
                'rank' => $rank++,
                'total_score' => $score->aggregate_total_score,
                'total_predictions' => $score->aggregate_total_predictions,
                'accuracy' => $score->aggregate_accuracy,
                'period' => 'all-time',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Batch insert for performance
        if (!empty($rankingData)) {
            \Illuminate\Support\Facades\DB::table('rankings')->insert($rankingData);
        }

        $this->info("Rankings refreshed successfully. Ranked {$scores->count()} users.");
    }
}
