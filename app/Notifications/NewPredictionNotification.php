<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPredictionNotification extends Notification
{
    use Queueable;

    protected $question;
    protected $creator;

    /**
     * Create a new notification instance.
     */
    public function __construct($question, $creator)
    {
        $this->question = $question;
        $this->creator = $creator;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'question_id' => $this->question->id,
            'question_text' => $this->question->questions,
            'creator_id' => $this->creator->id,
            'creator_name' => $this->creator->name,
            'message' => "{$this->creator->name} created a new prediction: \"{$this->question->questions}\"",
            'type' => 'new_prediction'
        ];
    }
}
