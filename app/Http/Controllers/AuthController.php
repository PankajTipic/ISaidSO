<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Traits\UploadsImages; // Import the Trait


class AuthController extends Controller
{
    use UploadsImages; // Use the Trait

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'login_method' => 'email',
        ]);

        // Generate verification token
        $token = Str::random(64);
        $expiresAt = now()->addHours(24);

        // Store token in database
        DB::table('email_verification_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send verification email
        $verificationUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/verify-email/' . $token;
        Mail::to($user->email)->send(new \App\Mail\VerifyEmail($verificationUrl, $user->name));

        return response()->json([
            'message' => 'Registration successful! Please check your email to verify your account.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
             return response()->json([
                 'message' => 'The provided email is not registered.',
                 'errors' => ['email' => ['The provided email is not registered.']]
             ], 422);
        }

        // Check if email is verified
        if (is_null($user->email_verified_at)) {
             return response()->json([
                 'message' => 'Please verify your email address.',
                 'errors' => ['email' => ['Please check your email to verify your account.']]
             ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password.',
                'errors' => ['password' => ['Incorrect password.']]
            ], 422); // Using 422 to allow frontend to map it to the field easily
        }

        // Check if user previously logged in with Google but is trying password now
        if ($user->login_method === 'google' && !$user->password) {
             return response()->json([
                 'message' => 'Please login with Google.',
                 'errors' => ['email' => ['This account uses Google Login.']]
             ], 422);
        }

        $user->update(['last_login_at' => now()]);
        
        return $this->issueTokens($user, $request);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function refresh(Request $request)
    {
        // Expecting the refresh token in the Authorization header
        // Sanctum will authenticate the user based on the refresh token provided
        
        $user = $request->user();
        $device = $request->header('User-Agent');
        
        Log::info("User {$user->name} refreshed token from device: {$device}. Used Refresh Token.");
        
        // Verify this is actually a refresh token
        if (!$user->currentAccessToken()->can('issue-access-token')) {
            return response()->json(['message' => 'Invalid token type'], 401);
        }

        // Revoke the used refresh token? 
        // Or keep it valid until 5 mins?
        // Requirement: "access token 3 min, refresh token 5 min". 
        // If we want rotation, we revoke old refresh and issue new pair.
        // Let's implement rotation for security.
        $user->currentAccessToken()->delete();

        return $this->issueTokens($user, $request);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username,' . $request->user()->id . '|max:20',
            'name' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'avatar' => 'nullable', // Allow string (URL) or file. Size/type checks handled manually or via conditional rules if needed.
        ]);

        $user = $request->user();
        
        // Handle avatar upload (expecting base64 string now if user cropped/selected on frontend)
        if ($request->has('avatar')) {
             // Use the trait method
             // Note: The frontend should send 'avatar' as a base64 string if it was modified/uploaded
             // If usage simply sends the file object via FormData, we need to convert or just support file uploads directly in trait too?
             // The user explicitly asked to use saveBase64ImageToS3 which takes base64. 
             // We should check if request avatar is a file or string.
             
             if ($request->hasFile('avatar')) {
                 // Convert file to base64 for the trait (or update trait to support both, but sticking to user request)
                 $file = $request->file('avatar');
                 $base64 = 'data:' . $file->getMimeType() . ';base64,' . base64_encode(file_get_contents($file->getRealPath()));
                 $avatarPath = $this->saveBase64ImageToS3($base64, 'avatars');
                 if ($avatarPath) {
                     $user->avatar = $avatarPath; // This will trigger the accessor if we have one, or just save path
                 }
             } else {
                 // It might be a base64 string or url string
                 $avatarPath = $this->saveBase64ImageToS3($request->avatar, 'avatars');
                 if ($avatarPath) {
                     $user->avatar = $avatarPath;
                 }
             }
        }

        // Update profile fields
        $user->username = $request->username;
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('country')) {
            $user->country = $request->country;
        }
        $user->is_profile_completed = 1;
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function verifyEmail(Request $request, $token)
    {
        // Find the verification token
        $verificationToken = DB::table('email_verification_tokens')
            ->where('token', $token)
            ->first();

        if (!$verificationToken) {
            return response()->json(['error' => 'Invalid verification token'], 400);
        }

        // Check if token has expired
        if (now()->greaterThan($verificationToken->expires_at)) {
            // Delete expired token
            DB::table('email_verification_tokens')->where('token', $token)->delete();
            return response()->json(['error' => 'Verification token has expired'], 400);
        }

        // Find the user
        $user = User::find($verificationToken->user_id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->save();

        // Delete the used token
        DB::table('email_verification_tokens')->where('token', $token)->delete();

        // Issue tokens for automatic login
        return $this->issueTokens($user, $request);
    }

    private function issueTokens(User $user, Request $request)
    {
        $this->logDevice($user, $request);
        
        $device = $request->header('User-Agent');
        Log::info("User {$user->name} logged in from device: {$device}");

        // Access Token: 3 minutes
        $accessToken = $user->createToken('access_token', ['access-api'], now()->addMinutes(3));
        
        // Refresh Token: 5 minutes (capability: issue-access-token)
        $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addMinutes(20));

        return response()->json([
            'user' => $user,
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
            'expires_in' => 180, // seconds
        ]);
    }

    private function logDevice(User $user, Request $request)
    {
        $agent = $request->header('User-Agent');
        $ip = $request->ip();
        
        // Simple device name extraction
        $deviceName = 'Unknown Device';
        if (str_contains($agent, 'Windows')) $deviceName = 'Windows PC';
        elseif (str_contains($agent, 'Macintosh')) $deviceName = 'Mac';
        elseif (str_contains($agent, 'Linux')) $deviceName = 'Linux PC';
        elseif (str_contains($agent, 'Android')) $deviceName = 'Android Device';
        elseif (str_contains($agent, 'iPhone')) $deviceName = 'iPhone';

        DB::table('user_devices')->updateOrInsert(
            [
                'user_id' => $user->id,
                'ip_address' => $ip,
                'device_name' => $deviceName
            ],
            [
                'last_active_at' => now(),
                'updated_at' => now()
            ]
        );
    }

    // Google Auth Methods placeholder
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    







    // public function handleGoogleCallback()
    // {
    //     try {
    //         $googleUser = Socialite::driver('google')
    //             ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
    //             ->stateless()
    //             ->user();
            
    //         $user = User::where('email', $googleUser->getEmail())->first();

    //         if (!$user) {
    //             // Determine username from email part or name
    //             $baseUsername = explode('@', $googleUser->getEmail())[0];
    //             $username = Str::substr($baseUsername, 0, 20);
                
    //             // Ensure unique username
    //             // ... (existing logic handled by create?)
    //             // Actually we just create user here
                
    //             $user = User::create([
    //                 'name' => $googleUser->getName(),
    //                 'email' => $googleUser->getEmail(),
    //                 'username' => $this->generateUniqueUsername($googleUser->getName()), // need helper or logic
    //                 'google_id' => $googleUser->getId(),
    //                 'avatar' => $googleUser->getAvatar(),
    //                 'password' => null, // No password for Google users
    //                 'login_method' => 'google',
    //                 'email_verified_at' => now(), // Auto-verify email from Google
    //             ]);
    //         } else {
    //              // Update google_id if missing (e.g. existing email, linking google)
    //              if (!$user->google_id) {
    //                  $user->update([
    //                     'google_id' => $googleUser->getId(),
    //                     'login_method' => 'google',
    //                     'email_verified_at' => $user->email_verified_at ?? now(), // Verify if not already
    //                  ]);
    //              } else {
    //                  // Ensure verified if logging in with Google
    //                  if (!$user->email_verified_at) {
    //                      $user->update(['email_verified_at' => now()]);
    //                  }
    //              }
    //         }
            
    //         // For OAuth callback, we usually return a view that sends message to opener or redirects with token in URL
    //         // Since this is an API, we probably need a frontend route to handle the callback code, 
    //         // OR this endpoint returns a redirect to the frontend with tokens in query params.
            
    //         // Simulating issueTokens logic for redirect
    //         $this->logDevice($user, request());
    //         $accessToken = $user->createToken('access_token', ['access-api'], now()->addMinutes(3));
    //         $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addMinutes(5));

    //         return redirect(env('FRONTEND_URL', 'http://127.0.0.1:8000') . '/auth/callback?access_token=' . $accessToken->plainTextToken . '&refresh_token=' . $refreshToken->plainTextToken);

    //     } catch (\Exception $e) {
    //         Log::error('Google Login Error: ' . $e->getMessage());
    //         return response()->json(['error' => 'Google Login Failed', 'message' => $e->getMessage()], 500);
    //     }
    // }

public function handleGoogleCallback()
    {
        \Log::info('Google callback received', [
            'full_url' => request()->fullUrl(),
            'query_params' => request()->query(),
            'has_code' => request()->has('code'),
            'code_value' => request()->input('code'),
            'has_state' => request()->has('state'),
            'user_agent' => request()->header('User-Agent'),
        ]);

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name'       => $googleUser->getName(),
                    'google_id'  => $googleUser->getId(),
                    'avatar'     => $googleUser->getAvatar(),
                    'password'   => bcrypt(Str::random(16)), // dummy password
                    'login_method' => 'google',
                    'email_verified_at' => now(),
                ]
            );

            // Log device
            $this->logDevice($user, request());

            // Create tokens
            $accessToken = $user->createToken('access_token', ['access-api'], now()->addMinutes(3));
            $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addMinutes(5));

            // $redirectUrl = env('FRONTEND_URL') . '/login'  // ← Change to valid frontend path (e.g., /login)
            //     . '?access_token='    . $accessToken->plainTextToken
            //     . '&refresh_token='   . $refreshToken->plainTextToken
            //     . '&expires_in=180';

            // return redirect($redirectUrl);

            return redirect(env('FRONTEND_URL') . '/auth'
    . '?access_token=' . $accessToken->plainTextToken
    . '&refresh_token=' . $refreshToken->plainTextToken
    . '&expires_in=180');

// Error case
return redirect(env('FRONTEND_URL') . '/auth?error=google_login_failed&message=' . urlencode($e->getMessage()));

        } catch (\Exception $e) {
            \Log::error('Google callback failed', [
                'exception' => $e->getMessage(),
                'query' => request()->query()->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect(env('FRONTEND_URL') . '/login?error=google_login_failed&message=' . urlencode($e->getMessage()));  // ← Change to valid frontend path
        }
    }








    private function generateUniqueUsername($name)
    {
        // specific logic to generate a unique username
        $baseUsername = Str::slug($name);
        if (empty($baseUsername)) {
            $baseUsername = 'user';
        }
        
        // Limit to 20 chars minus some buffer for numbers
        $baseUsername = substr($baseUsername, 0, 15);

        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    public function forgotPassword(Request $request) 
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // We usually don't want to reveal if email exists, but for now let's return success or standard message
            return response()->json(['message' => 'If your email is registered, you will receive a password reset link.']);
        }

        // Generate token
        $token = Str::random(64);

        // Delete existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Insert new token
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token, // You might want to Hash::make($token) in production if using Laravel's default hashing
            'created_at' => now()
        ]);

        // Send Email
        // Frontend URL: /reset-password?token=...&email=...
        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);
        
        try {
            Mail::to($request->email)->send(new \App\Mail\PasswordReset($resetUrl));
        } catch (\Exception $e) {
            Log::error("Failed to send password reset email: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. Please try again later.'], 500);
        }

        return response()->json(['message' => 'If your email is registered, you will receive a password reset link.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        // Verify token
        // Use where 'email' AND 'token'
        // Also check expiration (e.g. 60 mins)
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
             return response()->json(['message' => 'Invalid token.'], 400);
        }

        // Check expiration (assuming created_at is timestamp)
        // If created_at is string '2023-...', parse it
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token expired.'], 400);
        }

        // Update User Password
        $user = User::where('email', $request->email)->first();
        if (!$user) {
             return response()->json(['message' => 'User not found.'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Auto login the user? Request asks: "he can set the passwrod on that page and he will get automatically redirect to home screen if the profiel is completed"
        // This implies we should issue tokens and log them in.
        
        return $this->issueTokens($user, $request);
    }










public function profile()
{
    $user = Auth::user();

    // Load all related data
    $user->load([
        'questions.answers',   // questions with answers
        'answers.question',    // answers with question
        'points',
        'groups'
    ]);

    // Extra summary (optional but useful)
    $summary = [
        'total_questions' => $user->questions->count(),
        'total_answers'   => $user->answers->count(),
        'total_points'    => $user->points->sum('points'), // change column if needed
        'groups_joined'   => $user->groups->count(),
    ];

    return response()->json([
        'status'  => true,
        'message' => 'User profile fetched successfully',
        'user'    => $user,
        'summary' => $summary
    ]);
}










}
