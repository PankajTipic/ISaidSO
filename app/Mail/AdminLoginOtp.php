<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminLoginOtp extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;
    public $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otp, string $userName)
    {
        $this->otp = $otp;
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Admin Login Verification Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $html = "
        <div style=\"font-family: 'Outfit', 'Inter', sans-serif; background-color: #faf5ff; padding: 40px; color: #1e1b4b; text-align: center; border-radius: 24px;\">
            <div style=\"background: white; border: 1.5px solid #e9d5ff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.05); max-width: 480px; margin: 0 auto; text-align: left;\">
                <h1 style=\"font-size: 28px; font-weight: 800; margin-bottom: 8px; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 2px 10px rgba(124,58,237,0.05);\">I Said So</h1>
                <p style=\"font-size: 14px; color: #7c2d12; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;\">Admin Portal Security</p>
                <p style=\"font-size: 16px; line-height: 1.6; color: #4b5563;\">Hello {$this->userName},</p>
                <p style=\"font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;\">You are receiving this email because a login attempt to the Admin Dashboard was detected. Please use the following One-Time Passcode (OTP) to complete your verification:</p>
                
                <div style=\"background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); border: 1.5px dashed #a855f7; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 30px;\">
                    <span style=\"font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #7c3aed; font-family: monospace;\">{$this->otp}</span>
                </div>
                
                <p style=\"font-size: 14px; line-height: 1.6; color: #9ca3af; margin-bottom: 0;\">This verification code is valid for <strong>10 minutes</strong>. If you did not request this code, please secure your account credentials immediately.</p>
            </div>
            <p style=\"font-size: 12px; color: #9ca3af; margin-top: 24px;\">&copy; " . date('Y') . " I Said So. All rights reserved.</p>
        </div>";

        return new Content(
            htmlString: $html,
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
