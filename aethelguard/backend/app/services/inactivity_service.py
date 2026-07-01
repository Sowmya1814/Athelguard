"""
AethelGuard Inactivity Service
---------------------------------
Runs every 12 hours via APScheduler.
Checks if any user has exceeded their inactivity_days threshold.
If yes → sends alive check email with Yes/No links.
If user doesn't respond within 48 hours → vault gets locked
and nominee is notified they can request access.
"""

from datetime import datetime, timedelta
from app.services.email_service import send_inactivity_checkin
import os


def check_inactivity(app):
    """
    Main job function — called by scheduler every 12 hours.
    Must receive Flask app to push app context.
    """
    with app.app_context():
        from app import db
        from app.models.user import User

        now = datetime.utcnow()
        users = User.query.filter_by(is_active=True).all()

        for user in users:
            # ── Check if inactivity threshold exceeded ──────
            threshold = timedelta(days=user.inactivity_days)
            time_since_active = now - user.last_active

            if time_since_active >= threshold:
                # Already sent check-in email? Check 48hr deadline
                if user.checkin_sent_at:
                    deadline = user.checkin_sent_at + timedelta(hours=48)
                    if now > deadline and user.is_alive_confirmed is False:
                        # ── User didn't respond → lock vault ─
                        user.is_vault_locked = True
                        db.session.commit()
                        # Nominee will see "Request Access" is now auto-approvable
                        print(f"[INACTIVITY] Vault locked for user: {user.email}")
                    # else: still within 48hr window, wait
                else:
                    # ── First time triggering → send check-in email ──
                    base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
                    confirm_link = f"{base_url}/checkin/confirm?user_id={user.id}"
                    deny_link    = f"{base_url}/checkin/deny?user_id={user.id}"

                    try:
                        send_inactivity_checkin(
                            email=user.email,
                            name=user.name,
                            confirm_link=confirm_link,
                            deny_link=deny_link
                        )
                        user.checkin_sent_at    = now
                        user.is_alive_confirmed = False
                        db.session.commit()
                        print(f"[INACTIVITY] Check-in email sent to: {user.email}")
                    except Exception as e:
                        print(f"[INACTIVITY] Failed to send email to {user.email}: {e}")


def confirm_alive(user_id: int):
    """
    Called when user clicks 'YES I'm active' link in email.
    Resets their inactivity timer.
    """
    from app import db
    from app.models.user import User

    user = User.query.get(user_id)
    if user:
        user.last_active        = datetime.utcnow()
        user.checkin_sent_at    = None
        user.is_alive_confirmed = True
        user.is_vault_locked    = False
        db.session.commit()
        return True
    return False
