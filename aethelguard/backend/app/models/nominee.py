from app import db
from datetime import datetime
import bcrypt


class Nominee(db.Model):
    __tablename__ = "nominees"

    id                      = db.Column(db.Integer, primary_key=True)
    user_id                 = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    name                    = db.Column(db.String(100), nullable=False)
    email                   = db.Column(db.String(150), nullable=False)
    phone                   = db.Column(db.String(20), nullable=False)
    relationship            = db.Column(db.String(50), nullable=False)  # e.g. spouse, sibling

    # ─── Emergency Code (hashed) ─────────────────────────────
    # User sets this during registration → system emails it to nominee
    emergency_code_hash     = db.Column(db.Text, nullable=False)

    # ─── Password (nominee has their own login) ──────────────
    password_hash           = db.Column(db.Text, nullable=True)

    # ─── TOTP ───────────────────────────────────────────────
    totp_secret             = db.Column(db.String(64), nullable=True)
    is_totp_enabled         = db.Column(db.Boolean, default=False)

    # ─── Registration Status ─────────────────────────────────
    is_registered           = db.Column(db.Boolean, default=False)  # False until nominee completes registration
    registration_token      = db.Column(db.String(200), nullable=True)  # email link token
    token_expiry            = db.Column(db.DateTime, nullable=True)

    # ─── Access Request ─────────────────────────────────────
    access_requested_at     = db.Column(db.DateTime, nullable=True)
    access_granted_at       = db.Column(db.DateTime, nullable=True)
    access_status           = db.Column(db.String(20), default="none")
    # none | pending | approved | denied | auto_approved (after 24hr inactivity)

    # ─── Timestamps ─────────────────────────────────────────
    created_at              = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at              = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ─── Password Helpers ───────────────────────────────────
    def set_password(self, plain_password: str):
        self.password_hash = bcrypt.hashpw(
            plain_password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, plain_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            self.password_hash.encode("utf-8")
        )

    def set_emergency_code(self, plain_code: str):
        self.emergency_code_hash = bcrypt.hashpw(
            plain_code.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    def check_emergency_code(self, plain_code: str) -> bool:
        return bcrypt.checkpw(
            plain_code.encode("utf-8"),
            self.emergency_code_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id":               self.id,
            "user_id":          self.user_id,
            "name":             self.name,
            "email":            self.email,
            "phone":            self.phone,
            "relationship":     self.relationship,
            "is_registered":    self.is_registered,
            "access_status":    self.access_status,
            "is_totp_enabled":  self.is_totp_enabled,
            "created_at":       self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Nominee {self.email} for User {self.user_id}>"
