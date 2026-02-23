<?php

namespace App\Http\Controllers;

use App\Models\Point;
use Illuminate\Http\Request;

class PointController extends Controller
{
    // public function index()
    // {
    //     return Point::all();
    // }

    public function index()
{
    return Point::with('user')->get();
}

    public function show($id)
    {
        return Point::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'points' => 'integer',
        ]);

        return Point::create($validated);
    }

    public function update(Request $request, $id)
    {
        $point = Point::findOrFail($id);
        $validated = $request->validate([
            'user_id' => 'exists:users,id',
            'points' => 'integer',
        ]);

        $point->update($validated);
        return $point;
    }

    public function destroy($id)
    {
        $point = Point::findOrFail($id);
        $point->delete();
        return response()->json(['message' => 'Point deleted']);
    }
}
