from app import db
from datetime import datetime
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id                  = db.Column(db.Integer, primary_key=True)
    name                = db.Column(db.String(100), nullable=False)
    email               = db.Column(db.String(150), unique=True, nullable=False)
    age                 = db.Column(db.Integer, nullable=False)
    phone               = db.Column(db.String(20), nullable=False)
    password_hash       = db.Column(db.Text, nullable=False)
    role                = db.Column(db.String(20), default="user")   # user | admin

    # ─── TOTP ───────────────────────────────────────────────
    totp_secret         = db.Column(db.String(64), nullable=True)
    is_totp_enabled     = db.Column(db.Boolean, default=False)

    # ─── Inactivity ─────────────────────────────────────────
    inactivity_days     = db.Column(db.Integer, default=30)   # user chosen value
    last_active         = db.Column(db.DateTime, default=datetime.utcnow)
    checkin_sent_at     = db.Column(db.DateTime, nullable=True)   # when alive? email was sent
    is_alive_confirmed  = db.Column(db.Boolean, default=True)

    # ─── Account Status ─────────────────────────────────────
    is_active           = db.Column(db.Boolean, default=True)
    is_vault_locked     = db.Column(db.Boolean, default=False)  # True = nominee can access
    last_login          = db.Column(db.DateTime, nullable=True)

    # ─── Timestamps ─────────────────────────────────────────
    created_at          = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at          = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ─── Relationships ──────────────────────────────────────
    nominee             = db.relationship("Nominee", backref="user", uselist=False, cascade="all, delete-orphan")
    vault_items         = db.relationship("VaultItem", backref="user", cascade="all, delete-orphan")

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

    def to_dict(self):
        return {
            "id":               self.id,
            "name":             self.name,
            "email":            self.email,
            "age":              self.age,
            "phone":            self.phone,
            "role":             self.role,
            "inactivity_days":  self.inactivity_days,
            "last_active":      self.last_active.isoformat() if self.last_active else None,
            "is_active":        self.is_active,
            "is_vault_locked":  self.is_vault_locked,
            "last_login":       self.last_login.isoformat() if self.last_login else None,
            "is_totp_enabled":  self.is_totp_enabled,
            "created_at":       self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<User {self.email}>"
