"""
AethelGuard Email Service
---------------------------
Handles all outgoing emails:
  - Nominee registration invite
  - Emergency code delivery
  - Forgot password reset link
  - Inactivity alive check
  - Nominee access request notification
"""

from flask_mail import Message
from app import mail


def send_nominee_invite(nominee_email: str, nominee_name: str,
                        user_name: str, registration_link: str,
                        emergency_code: str):
    """
    Sent to nominee when user registers them.
    Contains registration link + their emergency code.
    """
    subject = f"AethelGuard — You've been added as a Nominee by {user_name}"
    body = f"""
Hello {nominee_name},

{user_name} has added you as their trusted Nominee on AethelGuard — a secure digital memory vault.

As a nominee, you will be able to access {user_name}'s vault in case they become inactive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — Complete Your Registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click the link below to set up your account:
{registration_link}

This link expires in 24 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — Your Emergency Code (Save This!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Emergency Code: {emergency_code}

⚠️  Keep this code PRIVATE and SAFE.
You will need this code to access the vault.
Do NOT share it with anyone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you did not expect this email, please ignore it.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[nominee_email], body=body)
    mail.send(msg)


def send_password_reset(email: str, name: str, reset_link: str):
    """Sent when user requests forgot password."""
    subject = "AethelGuard — Password Reset Request"
    body = f"""
Hello {name},

We received a request to reset your AetherGuard password.

Click the link below to reset your password:
{reset_link}

⚠️  This link expires in 1 hour.

If you did not request this, please ignore this email. Your password will not change.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[email], body=body)
    mail.send(msg)


def send_inactivity_checkin(email: str, name: str, confirm_link: str, deny_link: str):
    """
    Sent when user's inactivity timer triggers.
    User must confirm they are still active within 48 hours.
    """
    subject = "AethelGuard — Are you there? Vault Check-In Required"
    body = f"""
Hello {name},

This is your scheduled AethelGuard vault check-in.

We haven't detected any activity from your account recently.
Please confirm you are still active:

✅ YES, I'm active:  {confirm_link}
❌ NO (or ignore):   {deny_link}

⚠️  You have 48 hours to respond.
If we don't hear from you, your nominee may be notified.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[email], body=body)
    mail.send(msg)


def send_nominee_access_request(user_email: str, user_name: str,
                                 nominee_name: str, approve_link: str,
                                 deny_link: str):
    """
    Notifies the user that their nominee has requested vault access.
    User can approve or deny.
    """
    subject = f"AethelGuard — {nominee_name} is requesting access to your vault"
    body = f"""
Hello {user_name},

Your nominee {nominee_name} has requested access to your AethelGuard vault.

Please respond:

✅ APPROVE access:  {approve_link}
❌ DENY access:     {deny_link}

⚠️  If you do not respond within 24 hours, access may be automatically granted.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[user_email], body=body)
    mail.send(msg)


def send_access_granted(nominee_email: str, nominee_name: str, user_name: str):
    """Notify nominee that their access request was approved."""
    subject = "AethelGuard — Vault Access Granted"
    body = f"""
Hello {nominee_name},

Your request to access {user_name}'s AethelGuard vault has been approved.

You can now log in to your nominee dashboard and access the vault.

Note: Access will be available after a 30-60 minute security delay.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[nominee_email], body=body)
    mail.send(msg)


def send_access_denied(nominee_email: str, nominee_name: str, user_name: str):
    """Notify nominee that their access request was denied."""
    subject = "AethelGuard — Vault Access Request Denied"
    body = f"""
Hello {nominee_name},

Your request to access {user_name}'s AethelGuard vault has been denied by the account owner.

If you believe this is an error, please contact {user_name} directly.

— AethelGuard Security Team
"""
    msg = Message(subject=subject, recipients=[nominee_email], body=body)
    mail.send(msg)
