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
use App\Models\WhatsappOtp;
use Illuminate\Support\Facades\Http;



class AuthController extends Controller
{
    use UploadsImages; // Use the Trait

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'country' => 'required|string|max:255',
            'city' => 'required|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country' => $request->country,
            'city' => $request->city,
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
        $verificationUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') . '/verify-email/' . $token;
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
            \App\Models\AuditLog::log(null, 'failed_login', "Failed login attempt for unregistered email: {$request->email}");
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

        if ($user->is_blocked) {
            \App\Models\AuditLog::log($user->id, 'failed_login', 'Blocked user attempted login');
            return response()->json([
                'message' => 'Your account has been blocked by an administrator.',
                'errors' => ['email' => ['This account is blocked.']]
            ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            \App\Models\AuditLog::log($user->id, 'failed_login', 'Incorrect password attempt');
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

        // 2FA check for Admin, Super Admin, and System Admin roles
        if (in_array($user->role, ['admin', 'super_admin', 'system_admin'])) {
            $otp = strval(rand(100000, 999999));
            $user->two_factor_code = $otp;
            $user->two_factor_expires_at = now()->addMinutes(10);
            $user->save();

            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\AdminLoginOtp($otp, $user->name));
                \App\Models\AuditLog::log($user->id, '2fa_generated', "2FA verification code sent to {$user->email}");
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send 2FA email: " . $e->getMessage());
                return response()->json([
                    'message' => 'Failed to send 2FA verification email. Please contact support.',
                    'errors' => ['email' => ['Failed to send 2FA email.']]
                ], 500);
            }

            return response()->json([
                'requires_2fa' => true,
                'email' => $user->email,
                'message' => 'A 2FA code has been sent to your registered email.'
            ], 200);
        }

        $user->update(['last_login_at' => now()]);

        return $this->issueTokens($user, $request);
    }

    public function verify2fa(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (!$user->two_factor_code || $user->two_factor_code !== $request->otp) {
            return response()->json([
                'message' => 'Invalid verification code.',
                'errors' => ['otp' => ['Invalid verification code.']]
            ], 422);
        }

        if (now()->greaterThan($user->two_factor_expires_at)) {
            return response()->json([
                'message' => 'Verification code has expired.',
                'errors' => ['otp' => ['Verification code has expired.']]
            ], 422);
        }

        // Clear 2FA data
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->last_login_at = now();
        $user->save();

        // Log successful login
        \App\Models\AuditLog::log($user->id, 'login', 'Admin logged in successfully via 2FA');

        return $this->issueTokens($user, $request);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            \App\Models\AuditLog::log($user->id, 'logout', 'User logged out');
            $user->currentAccessToken()->delete();
        }
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
            'username' => 'nullable|string|unique:users,username,' . $request->user()->id . '|max:20',
            'name' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
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
            }
            else {
                // It might be a base64 string or url string
                $avatarPath = $this->saveBase64ImageToS3($request->avatar, 'avatars');
                if ($avatarPath) {
                    $user->avatar = $avatarPath;
                }
            }
        }

        // Update profile fields
        if ($request->has('username')) {
            $user->username = $request->username;
        }
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('country')) {
            $user->country = $request->country;
        }
        if ($request->has('city')) {
            $user->city = $request->city;
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

        // Log non-admin logins here (admins are logged in verify2fa)
        if (!in_array($user->role, ['admin', 'super_admin', 'system_admin'])) {
            \App\Models\AuditLog::log($user->id, 'login', 'User logged in successfully');
        }

        // Access Token: 7 days
        $accessToken = $user->createToken('access_token', ['access-api'], now()->addDays(7));

        // Refresh Token: 30 days
        $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));

        return response()->json([
            'user' => $user,
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
            'expires_in' => 604800, // 7 days in seconds
        ]);
    }

    private function logDevice(User $user, Request $request)
    {
        $agent = $request->header('User-Agent');
        $ip = $request->ip();

        // Simple device name extraction
        $deviceName = 'Unknown Device';
        if (str_contains($agent, 'Windows'))
            $deviceName = 'Windows PC';
        elseif (str_contains($agent, 'Macintosh'))
            $deviceName = 'Mac';
        elseif (str_contains($agent, 'Linux'))
            $deviceName = 'Linux PC';
        elseif (str_contains($agent, 'Android'))
            $deviceName = 'Android Device';
        elseif (str_contains($agent, 'iPhone'))
            $deviceName = 'iPhone';

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








  
    public function handleGoogleCallback()
    {
        Log::info('Google callback received', [
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
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => bcrypt(Str::random(16)), // dummy password
                'login_method' => 'google',
                'email_verified_at' => now(),
            ]
            );

            // Log device
            $this->logDevice($user, request());

            // Create tokens
            $accessToken = $user->createToken('access_token', ['access-api'], now()->addDays(7));
            $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));

            // $redirectUrl = env('FRONTEND_URL') . '/login'  // ← Change to valid frontend path (e.g., /login)
            //     . '?access_token='    . $accessToken->plainTextToken
            //     . '&refresh_token='   . $refreshToken->plainTextToken
            //     . '&expires_in=604800';

            // return redirect($redirectUrl);

            return redirect(rtrim(env('FRONTEND_URL'), '/') . '/auth'
                . '?access_token=' . $accessToken->plainTextToken
                . '&refresh_token=' . $refreshToken->plainTextToken
                . '&expires_in=604800');

        }
        catch (\Exception $e) {
            Log::error('Google callback failed', [
                'exception' => $e->getMessage(),
                'query' => request()->query()->all(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect(rtrim(env('FRONTEND_URL'), '/') . '/login?error=google_login_failed&message=' . urlencode($e->getMessage())); // ← Change to valid frontend path
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
        $resetUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        try {
            Mail::to($request->email)->send(new \App\Mail\PasswordReset($resetUrl));
        }
        catch (\Exception $e) {
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
            'questions.answers', // questions with answers
            'answers.question', // answers with question
            'points',
            'groups'
        ]);

        // Extra summary (optional but useful)
        $summary = [
            'total_questions' => $user->questions->count(),
            'total_answers' => $user->answers->count(),
            'total_points' => $user->points->sum('points'),
            'groups_joined' => $user->groups->count(),
        ];

        // Badges calculation
        $badges = [];
        $badges[] = [
            'id' => 'welcome',
            'name' => 'Welcome Aboard',
            'icon' => '👋',
            'description' => 'Joined the I Said So community'
        ];

        if ($summary['total_questions'] > 0) {
            $badges[] = [
                'id' => 'creator',
                'name' => 'Curious Creator',
                'icon' => '💡',
                'description' => 'Created your first question'
            ];
        }

        if ($summary['total_answers'] >= 5) {
            $badges[] = [
                'id' => 'predictor',
                'name' => 'Master Predictor',
                'icon' => '🔮',
                'description' => 'Answered 5 or more questions'
            ];
        }

        if ($summary['total_points'] >= 100) {
            $badges[] = [
                'id' => 'high_scorer',
                'name' => 'High Scorer',
                'icon' => '🏆',
                'description' => 'Earned over 100 points'
            ];
        }

        if ($summary['groups_joined'] >= 3) {
            $badges[] = [
                'id' => 'social_butterfly',
                'name' => 'Social Butterfly',
                'icon' => '🦋',
                'description' => 'Joined 3 or more groups'
            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'User profile fetched successfully',
            'user' => $user,
            'summary' => $summary,
            'badges' => $badges,
        ]);
    }





    // Apple
    public function redirectToApple()
    {
        return Socialite::driver('apple')->stateless()->redirect();
    }

    public function handleAppleCallback()
    {
        return $this->handleSocialCallback('apple');
    }

    // Facebook
    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->stateless()->redirect();
    }

    public function handleFacebookCallback()
    {
        return $this->handleSocialCallback('facebook');
    }

    // Microsoft
    public function redirectToMicrosoft()
    {
        return Socialite::driver('microsoft')->stateless()->redirect();
    }

    public function handleMicrosoftCallback()
    {
        return $this->handleSocialCallback('microsoft');
    }


    // private function handleSocialCallback(string $provider)
    // {
    //     Log::info("{$provider} callback received", [
    //         'full_url' => request()->fullUrl(),
    //         'query' => request()->query()->all(),
    //     ]);

    //     try {
    //         $socialUser = Socialite::driver($provider)->stateless()->user();

    //         $user = User::updateOrCreate(
    //             ['email' => $socialUser->getEmail()],
    //             [
    //                 'name'          => $socialUser->getName(),
    //                 'email'         => $socialUser->getEmail(),
    //                 'avatar'        => $socialUser->getAvatar(),
    //                 'password'      => bcrypt(Str::random(24)), // dummy password
    //                 'login_method'  => $provider,
    //                 'email_verified_at' => now(),
    //                 // Provider-specific IDs
    //                 "{$provider}_id" => $socialUser->getId(),
    //             ]
    //         );

    //         // Log device
    //         $this->logDevice($user, request());

    //         // Issue tokens
    //         $accessToken = $user->createToken('access_token', ['access-api'], now()->addDays(7));
    //         $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));

    //         $redirectUrl = rtrim(env('FRONTEND_URL'), '/') . '/auth' .
    //             '?access_token=' . $accessToken->plainTextToken .
    //             '&refresh_token=' . $refreshToken->plainTextToken .
    //             '&expires_in=604800';

    //         return redirect($redirectUrl);

    //     } catch (\Exception $e) {
    //         Log::error("{$provider} callback failed", [
    //             'exception' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString(),
    //         ]);

    //         return redirect(rtrim(env('FRONTEND_URL'), '/') . '/login?error=' . $provider . '_login_failed&message=' . urlencode($e->getMessage()));
    //     }
    // }




    private function handleSocialCallback(string $provider)
{
    Log::info("{$provider} callback received", [
        'full_url' => request()->fullUrl(),
        'query' => request()->query(),
    ]);

    try {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        // Email null check
        $email = $socialUser->getEmail();
        if (empty($email)) {
            $email = $socialUser->getId() . '@' . $provider . '.placeholder.com';
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'              => $socialUser->getName(),
                'email'             => $email,
                'avatar'            => $socialUser->getAvatar(),
                'password'          => bcrypt(Str::random(24)),
                'login_method'      => $provider,
                'email_verified_at' => now(),
                "{$provider}_id"    => $socialUser->getId(),
            ]
        );

        $this->logDevice($user, request());

        $accessToken  = $user->createToken('access_token', ['access-api'], now()->addDays(7));
        $refreshToken = $user->createToken('refresh_token', ['issue-access-token'], now()->addDays(30));

        $redirectUrl = rtrim(env('FRONTEND_URL'), '/') . '/auth'
            . '?access_token='  . $accessToken->plainTextToken
            . '&refresh_token=' . $refreshToken->plainTextToken
            . '&expires_in=604800';

        return redirect($redirectUrl);

    } catch (\Exception $e) {
        Log::error("{$provider} callback failed", [
            'exception' => $e->getMessage(),
            'trace'     => $e->getTraceAsString(),
        ]);

        return redirect(rtrim(env('FRONTEND_URL'), '/') . '/login?error=' . $provider . '_login_failed&message=' . urlencode($e->getMessage()));
    }
}








// Change Password
public function changePassword(Request $request)
{
    $request->validate([
        'current_password'  => 'required',
        'password'          => 'required|min:8|confirmed',
    ]);

    $user = Auth::user();

    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Current password is incorrect.',
        ], 422);
    }

    $user->password = Hash::make($request->password);
    $user->save();

    return response()->json(['message' => 'Password changed successfully.']);
}

// Change Email
public function changeEmail(Request $request)
{
    $request->validate([
        'email'    => 'required|email|unique:users,email',
        'password' => 'required',
    ]);

    $user = Auth::user();

    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Password is incorrect.',
        ], 422);
    }

    $user->email = $request->email;
    $user->email_verified_at = null; // force re-verification
    $user->save();

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
    try {
        $verificationUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') . '/verify-email/' . $token;
        Mail::to($user->email)->send(new \App\Mail\VerifyEmail($verificationUrl, $user->name));
    } catch (\Exception $e) {
        Log::error("Failed to send email verification during change email: " . $e->getMessage());
    }

    return response()->json(['message' => 'Email updated successfully. Please verify your new email address.']);
}








public function sendWhatsappOtp(Request $request)
{
    $request->validate([
        'phone' => 'required'
    ]);

    $otp = rand(100000,999999);

    WhatsappOtp::updateOrCreate(
        [
            'phone' => $request->phone
        ],
        [
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10)
        ]
    );

    $response = Http::withToken(env('WHATSAPP_TOKEN'))
        ->post(
            'https://graph.facebook.com/v23.0/' .
            env('WHATSAPP_PHONE_NUMBER_ID') .
            '/messages',
            [
                'messaging_product' => 'whatsapp',
                'to' => $request->phone,
                'type' => 'template',
                'template' => [
                    'name' => 'otp_auth',
                    'language' => [
                        'code' => 'en_US'
                    ],
                    'components' => [
                        [
                            'type' => 'body',
                            'parameters' => [
                                [
                                    'type' => 'text',
                                    'text' => (string)$otp
                                ]
                            ]
                        ],
                        [
                            'type' => 'button',
                            'sub_type' => 'url',
                            'index' => '0',
                            'parameters' => [
                                [
                                    'type' => 'text',
                                    'text' => (string)$otp
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        );

    if (!$response->successful()) {
        return response()->json([
            'message' => 'WhatsApp API Failed',
            'error' => $response->json()
        ], 500);
    }

    return response()->json([
        'success' => true,
        'message' => 'OTP sent successfully'
    ]);
}


// public function verifyWhatsappOtp(Request $request)
// {
//     $request->validate([
//         'phone' => 'required',
//         'otp' => 'required'
//     ]);

//     $record = WhatsappOtp::where('phone', $request->phone)
//         ->where('otp', $request->otp)
//         ->first();

//     if (!$record) {
//         return response()->json([
//             'message' => 'Invalid OTP'
//         ], 422);
//     }

//     if (now()->greaterThan($record->expires_at)) {
//         return response()->json([
//             'message' => 'OTP expired'
//         ], 422);
//     }

//     $user = User::where('phone', $request->phone)->first();

//     if (!$user) {

//         $user = User::create([
//             'name' => 'WhatsApp User',
//             'phone' => $request->phone,
//             'login_method' => 'whatsapp',
//             'email_verified_at' => now(),
//         ]);
//     }

//     $record->delete();

//     return $this->issueTokens($user, $request);
// }



public function verifyWhatsappOtp(Request $request)
{
    $request->validate([
        'phone' => 'required',
        'otp' => 'required'
    ]);

    $record = WhatsappOtp::where('phone', $request->phone)
        ->where('otp', $request->otp)
        ->first();

    if (!$record) {
        return response()->json([
            'message' => 'Invalid OTP'
        ], 422);
    }

    if (now()->greaterThan($record->expires_at)) {
        return response()->json([
            'message' => 'OTP expired'
        ], 422);
    }

    $isNewUser = false;

    $user = User::where('phone', $request->phone)->first();

    if (!$user) {

        $isNewUser = true;

        $user = User::create([
            'name' => 'WhatsApp User',
            'phone' => $request->phone,
            'login_method' => 'whatsapp',
            'email_verified_at' => now(),
        ]);
    }

    $record->delete();

    $tokens = $this->issueTokens($user, $request);

    $data = $tokens->getData(true);

    $data['is_new_user'] = $isNewUser;

    return response()->json($data);
}


}
