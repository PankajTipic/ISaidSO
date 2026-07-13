<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DataBreachNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $breachDescription,
        public string $detectedAt,
        public string $actionRequired,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Important Security Notice — I Said So',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.data-breach',
            with: [
                'userName'          => $this->userName,
                'breachDescription' => $this->breachDescription,
                'detectedAt'        => $this->detectedAt,
                'actionRequired'    => $this->actionRequired,
            ],
        );
    }
}
