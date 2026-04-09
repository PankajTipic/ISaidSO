<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DevAccessController extends Controller
{
    /**
     * Verify dev access credentials.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $access = DB::table('dev_access')
            ->where('username', $request->username)
            ->first();

        if ($access && Hash::check($request->password, $access->password)) {
            return response()->json([
                'status' => true,
                'message' => 'Dev access granted',
                'dev_token' => base64_encode($request->username . ':' . now()->timestamp) // Simple token for client-side storage
            ]);
        }

        return response()->json([
            'status' => false,
            'message' => 'Invalid developer credentials'
        ], 401);
    }

    /**
     * Seed initial dev credentials if table is empty.
     */
    public function seed()
    {
        if (DB::table('dev_access')->count() === 0) {
            DB::table('dev_access')->insert([
                'username' => 'admin',
                'password' => Hash::make('devpassword123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return response()->json(['message' => 'Default dev credentials created: admin / devpassword123']);
        }
        return response()->json(['message' => 'Dev access already seeded']);
    }
}
