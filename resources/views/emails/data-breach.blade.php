@component('mail::message')
# ⚠️ Important Security Notice

Dear {{ $userName }},

We are writing to inform you of a security incident that may have affected your account on **I Said So**.

---

**What happened:**
{{ $breachDescription }}

**When it was detected:**
{{ $detectedAt }}

**What you should do:**
{{ $actionRequired }}

---

We take the security of your data very seriously. This notification is being sent in accordance with the **General Data Protection Regulation (GDPR) Article 34**, which requires us to notify affected users within 72 hours of becoming aware of a data breach.

If you have any questions or concerns, please contact us immediately.

@component('mail::button', ['url' => config('app.url') . '/contact', 'color' => 'red'])
Contact Us
@endcomponent

We sincerely apologize for any inconvenience this may cause.

**The I Said So Team**

---

*This is an automated security notification. Please do not reply to this email.*
@endcomponent
