<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
        ['email' => 'admin@isaidso.com'],
        [
            'name' => 'System Admin',
            'username' => 'admin',
            'password' => Hash::make('Admin@123'),
            'role' => 'admin',
            'is_blocked' => false,
            'is_profile_completed' => true,
            'email_verified_at' => now(),
        ]
        );

        $this->command->info('Admin user created/updated successfully.');
        $this->command->info('Email: admin@isaidso.com');
        $this->command->info('Password: Admin@123');
    }
}
