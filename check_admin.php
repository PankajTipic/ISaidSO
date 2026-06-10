<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$email = 'pankajchougale07@gmail.com';
$user = App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "❌ User NOT found with email: $email\n";
} else {
    echo "✅ User found!\n";
    echo "   Name:         " . $user->name . "\n";
    echo "   Email:        " . $user->email . "\n";
    echo "   Role:         " . $user->role . "\n";
    echo "   Is Blocked:   " . ($user->is_blocked ? 'YES' : 'NO') . "\n";
    echo "   Email Verified: " . ($user->email_verified_at ? 'YES - ' . $user->email_verified_at : 'NO') . "\n";
    echo "   Login Method: " . $user->login_method . "\n";
    echo "   Has Password: " . (strlen($user->password) > 0 ? 'YES (hash len=' . strlen($user->password) . ')' : 'NO') . "\n";
    
    // Test password check
    $testPassword = 'Admin@123';
    $correct = Illuminate\Support\Facades\Hash::check($testPassword, $user->password);
    echo "   Password 'Admin\@123' matches: " . ($correct ? 'YES ✅' : 'NO ❌') . "\n";
}
