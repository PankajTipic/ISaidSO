<?php

namespace App\Http\Controllers;

use App\Models\Field;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index()
    {
        return Field::all();
    }

    public function show($id)
    {
        return Field::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fields' => 'required|string',
        ]);

        return Field::create($validated);
    }

    public function update(Request $request, $id)
    {
        $field = Field::findOrFail($id);
        $validated = $request->validate([
            'fields' => 'string',
        ]);

        $field->update($validated);
        return $field;
    }

    public function destroy($id)
    {
        $field = Field::findOrFail($id);
        $field->delete();
        return response()->json(['message' => 'Field deleted']);
    }
}