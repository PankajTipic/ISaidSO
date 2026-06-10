<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'pankajchougale07@gmail.com';
$user = App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "User NOT found\n";
    exit(1);
}

// Reset password to Admin@123
$user->password = Illuminate\Support\Facades\Hash::make('Admin@123');
$user->save();

// Verify it works now
$correct = Illuminate\Support\Facades\Hash::check('Admin@123', $user->password);
echo "Password reset to 'Admin@123': " . ($correct ? 'SUCCESS' : 'FAILED') . "\n";
echo "Role: " . $user->role . "\n";
