from app import db
from datetime import datetime


class VaultItem(db.Model):
    __tablename__ = "vault_items"

    id                  = db.Column(db.Integer, primary_key=True)
    user_id             = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # ─── Item Type ──────────────────────────────────────────
    item_type           = db.Column(db.String(10), nullable=False)  # "file" | "text"
    title               = db.Column(db.String(200), nullable=False) # user-given name

    # ─── Encrypted Content ───────────────────────────────────
    # For text  → encrypted text stored here directly
    # For files → encrypted file stored on disk, path stored here
    encrypted_content   = db.Column(db.Text, nullable=True)         # for text items
    file_path           = db.Column(db.Text, nullable=True)         # for file items (encrypted file on disk)
    original_filename   = db.Column(db.String(255), nullable=True)  # original file name
    file_size           = db.Column(db.BigInteger, nullable=True)   # in bytes
    mime_type           = db.Column(db.String(100), nullable=True)  # e.g. image/png, application/pdf

    # ─── AES Key (per-file, encrypted with Master AES key) ──
    # Each file/text has its own unique AES-256 key
    # That key is encrypted with MASTER_AES_KEY and stored here
    encrypted_file_key  = db.Column(db.Text, nullable=False)        # encrypted per-file AES key
    iv                  = db.Column(db.Text, nullable=False)        # initialization vector used for encryption

    # ─── Timestamps ─────────────────────────────────────────
    created_at          = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at          = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_content=False):
        data = {
            "id":                self.id,
            "user_id":           self.user_id,
            "item_type":         self.item_type,
            "title":             self.title,
            "original_filename": self.original_filename,
            "file_size":         self.file_size,
            "mime_type":         self.mime_type,
            "created_at":        self.created_at.isoformat(),
            "updated_at":        self.updated_at.isoformat(),
        }
        # Only include decrypted content when explicitly requested
        # (e.g. when user/nominee is viewing the item)
        if include_content:
            data["content"] = self.encrypted_content  # will be decrypted in route
        return data

    def __repr__(self):
        return f"<VaultItem {self.title} ({self.item_type}) for User {self.user_id}>"
