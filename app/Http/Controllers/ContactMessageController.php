<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactMessageController extends Controller
{
    /**
     * Submit a contact form message.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $validated['user_id'] = Auth::id(); // Will be null if guest
        $validated['is_read'] = false;

        $message = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Your message has been sent successfully. We will get back to you soon!',
            'data' => $message
        ], 201);
    }

    /**
     * List all contact messages (Admin only).
     */
    public function index()
    {
        $messages = ContactMessage::with('user:id,name,username,avatar')
            ->latest()
            ->paginate(20);

        return response()->json($messages);
    }

    /**
     * Get a specific contact message (Admin only) and mark it as read.
     */
    public function show($id)
    {
        $message = ContactMessage::with('user:id,name,username,avatar')->findOrFail($id);

        if (!$message->is_read) {
            $message->is_read = true;
            $message->save();
        }

        return response()->json($message);
    }

    /**
     * Toggle read status (Admin only).
     */
    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->is_read = !$message->is_read;
        $message->save();

        return response()->json([
            'message' => $message->is_read ? 'Message marked as read.' : 'Message marked as unread.',
            'data' => $message
        ]);
    }

    /**
     * Delete a contact message (Admin only).
     */
    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully.'
        ]);
    }
}
