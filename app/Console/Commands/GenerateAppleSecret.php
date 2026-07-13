<?php
 
namespace App\Console\Commands;
 
use Illuminate\Console\Command;
use Firebase\JWT\JWT;
 
class GenerateAppleSecret extends Command
{
    protected $signature = 'apple:secret';
 
    public function handle()
    {
        $teamId = env('APPLE_TEAM_ID');
        $clientId = env('APPLE_CLIENT_ID');
        $keyId = env('APPLE_KEY_ID');
 
        $privateKey = file_get_contents(storage_path('app/apple/AuthKey_JC2TM7W786.p8'));
 
        $payload = [
            'iss' => $teamId,
            'iat' => time(),
            'exp' => time() + (86400 * 180),
            'aud' => 'https://appleid.apple.com',
            'sub' => $clientId,
        ];
 
        $jwt = JWT::encode(
            $payload,
            $privateKey,
            'ES256',
            $keyId
        );
 
        $this->info($jwt);
    }
}