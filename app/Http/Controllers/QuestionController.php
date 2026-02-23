<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function index()
    {
        return Question::all();
    }



    public function show($id)
    {
        return Question::findOrFail($id);
    }




    
public function questionsByUserId()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'error' => 'User not authenticated'
            ], 401);
        }

        $questions = Question::where('user_id', $userId)
            ->with(['field', 'answerType'])

            // ✅ Load answers with user
            ->with(['answers.user'])

            // ✅ Count how many users answered
            ->withCount('answers')

            ->latest()
            ->get();

        return response()->json([
            'message' => 'My questions fetched successfully',
            'data' => $questions
        ]);
    }



    public function store(Request $request)
    {
        $validated = $request->validate([
            // 'user_id'        => 'required|exists:users,id',
            'field_id' => 'required|exists:fields,id',
            'questions' => 'required|string',
            'ans_type_id' => 'required|exists:answer_types,id',
            'options' => 'required_if:ans_type_id,2|array|min:2|max:6|nullable',
            'correct_answer' => 'required|string',
            'start_date' => 'date|nullable',
            'end_date' => 'date|nullable',
            'visibility' => 'string|in:public,private',
        ]);

        $validated['user_id'] = Auth::id();

        if ($validated['ans_type_id'] == 2) {
            $options = $validated['options'] ?? [];
            if (!in_array($validated['correct_answer'], $options)) {
                return response()->json([
                    'error' => 'Correct answer must be one of the provided options'
                ], 422);
            }
        }


        $question = Question::create($validated);

        return response()->json($question, 201);
    }





    public function update(Request $request, $id)
    {


        $question = Question::findOrFail($id);


        if ($question->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Unauthorized. You can edit only your own question.'
            ], 403);
        }

        $validated = $request->validate([

            'field_id' => 'exists:fields,id',
            'questions' => 'string',
            'ans_type_id' => 'exists:answer_types,id',
            'start_date' => 'date|nullable',
            'end_date' => 'date|nullable',
            'visibility' => 'string',
        ]);

        $question->update($validated);
        return $question;
    }

    public function destroy($id)
    {
        $question = Question::findOrFail($id);

        // ✅ Ownership Check
        if ($question->user_id !== Auth::id()) {
            return response()->json([
                'error' => 'Unauthorized. You can delete only your own question.'
            ], 403);
        }
        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }




    public function publicIndex()
    {
        $questions = Question::where('visibility', 'public')
            ->with(['field', 'answerType', 'user', 'answers'])
            ->withCount('answers')
            ->latest()
            ->get();

        $questions->each(function ($question) {
            $question->makeHidden(['correct_answer']);
        });

        return response()->json($questions);
    }

    public function showForAnswer($id)
    {
        $question = Question::with(['field', 'answerType', 'user', 'answers'])
            ->withCount('answers')
            ->findOrFail($id);

        if ($question->visibility !== 'public') {
            return response()->json(['error' => 'This question is private'], 403);
        }


        $question->makeHidden(['correct_answer']);

        return response()->json($question);
    }


}