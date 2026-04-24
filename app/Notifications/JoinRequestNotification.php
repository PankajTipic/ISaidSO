<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestNotification extends Notification
{
    use Queueable;

    protected $requester;
    protected $group;

    /**
     * Create a new notification instance.
     */
    public function __construct($requester, $group)
    {
        $this->requester = $requester;
        $this->group = $group;
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
            'type' => 'join_request',
            'requester_id' => $this->requester->id,
            'requester_name' => $this->requester->name ?? $this->requester->username,
            'group_id' => $this->group->id,
            'group_name' => $this->group->name,
            'message' => "{$this->requester->username} wants to join your group '{$this->group->name}'",
        ];
    }
}
