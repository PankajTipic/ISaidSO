<?php
namespace App\Http\Controllers;

use App\Models\AnswerType;
use Illuminate\Http\Request;

class AnswerTypeController extends Controller
{
    public function index()
    {
        return AnswerType::all();
    }

    public function show($id)
    {
        return AnswerType::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ans_type' => 'required|string',
        ]);

        return AnswerType::create($validated);
    }

    public function update(Request $request, $id)
    {
        $answerType = AnswerType::findOrFail($id);
        $validated = $request->validate([
            'ans_type' => 'string',
        ]);

        $answerType->update($validated);
        return $answerType;
    }

    public function destroy($id)
    {
        $answerType = AnswerType::findOrFail($id);
        $answerType->delete();
        return response()->json(['message' => 'Answer Type deleted']);
    }
}