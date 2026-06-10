<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get a setting by key.
     */
    public function getSetting($key)
    {
        $setting = Setting::where('key', $key)->first();

        return response()->json([
            'key' => $key,
            'value' => $setting ? $setting->value : ''
        ]);
    }

    /**
     * Create or update a setting (Admin only).
     */
    public function updateSetting(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'nullable|string'
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $validated['key']],
            ['value' => $validated['value'] ?? '']
        );

        return response()->json([
            'message' => 'Setting updated successfully.',
            'setting' => $setting
        ]);
    }
}
