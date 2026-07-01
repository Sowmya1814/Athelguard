"""
AethelGuard Encryption Service
--------------------------------
Key derivation tries 200k iterations first (for existing files),
then falls back to 100k (for new files going forward).
Both old and new files decrypt correctly.
"""

import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidTag


# ─────────────────────────────────────────────────────────────
# MASTER KEY
# ─────────────────────────────────────────────────────────────
def _get_master_key() -> bytes:
    hex_key = os.getenv("MASTER_AES_KEY")
    if not hex_key:
        raise ValueError("MASTER_AES_KEY not set in .env")
    return bytes.fromhex(hex_key)


# ─────────────────────────────────────────────────────────────
# PER-USER KEY DERIVATION
# ─────────────────────────────────────────────────────────────
def _derive_key_with_iterations(user_id: int, password_hash: str, iterations: int) -> bytes:
    """Derive user key with a specific iteration count."""
    master_key = _get_master_key()
    salt = hashlib.sha256(
        master_key + str(user_id).encode("utf-8")
    ).digest()
    kdf = PBKDF2HMAC(
        algorithm  = hashes.SHA256(),
        length     = 32,
        salt       = salt,
        iterations = iterations,
    )
    return kdf.derive(password_hash.encode("utf-8"))


def derive_user_key(user_id: int, password_hash: str) -> bytes:
    """
    Derive user key using the current default (100k iterations).
    Used for NEW uploads only.
    """
    return _derive_key_with_iterations(user_id, password_hash, 100_000)


# ─────────────────────────────────────────────────────────────
# PER-FILE KEY GENERATION
# ─────────────────────────────────────────────────────────────
def generate_file_key() -> bytes:
    return os.urandom(32)


# ─────────────────────────────────────────────────────────────
# ENCRYPT PER-FILE KEY  (always uses 100k going forward)
# ─────────────────────────────────────────────────────────────
def encrypt_file_key(per_file_key: bytes,
                     user_id: int = None,
                     password_hash: str = None) -> tuple:
    if user_id and password_hash:
        encryption_key = derive_user_key(user_id, password_hash)  # 100k
    else:
        encryption_key = _get_master_key()

    iv     = os.urandom(12)
    aesgcm = AESGCM(encryption_key)
    encrypted_key = aesgcm.encrypt(iv, per_file_key, None)

    return (
        base64.b64encode(encrypted_key).decode("utf-8"),
        base64.b64encode(iv).decode("utf-8")
    )


# ─────────────────────────────────────────────────────────────
# DECRYPT PER-FILE KEY  (tries 200k first, then 100k)
# ─────────────────────────────────────────────────────────────
def decrypt_file_key(encrypted_key_b64: str, iv_b64: str,
                     user_id: int = None,
                     password_hash: str = None) -> bytes:
    """
    Try decrypting with 200k iterations first (covers all existing files).
    If that fails (InvalidTag), try 100k (new files encrypted after the fix).
    If both fail, try master key fallback.
    """
    iv            = base64.b64decode(iv_b64)
    encrypted_key = base64.b64decode(encrypted_key_b64)

    if user_id and password_hash:
        # Try 200k first — covers files uploaded before the iteration change
        for iterations in [200_000, 100_000]:
            try:
                key    = _derive_key_with_iterations(user_id, password_hash, iterations)
                aesgcm = AESGCM(key)
                return aesgcm.decrypt(iv, encrypted_key, None)
            except (InvalidTag, Exception):
                continue

    # Fallback: master key (for items encrypted without user key)
    try:
        master_key = _get_master_key()
        aesgcm     = AESGCM(master_key)
        return aesgcm.decrypt(iv, encrypted_key, None)
    except Exception:
        pass

    raise ValueError(
        "Could not decrypt file key. "
        "The file may have been encrypted with a different password or key."
    )


# ─────────────────────────────────────────────────────────────
# ENCRYPT TEXT
# ─────────────────────────────────────────────────────────────
def encrypt_text(plain_text: str,
                 user_id: int = None,
                 password_hash: str = None) -> dict:
    per_file_key = generate_file_key()

    text_iv = os.urandom(12)
    aesgcm  = AESGCM(per_file_key)
    encrypted_bytes = aesgcm.encrypt(text_iv, plain_text.encode("utf-8"), None)

    enc_key_b64, key_iv_b64 = encrypt_file_key(per_file_key, user_id, password_hash)

    return {
        "encrypted_content":  base64.b64encode(encrypted_bytes).decode("utf-8"),
        "encrypted_file_key": enc_key_b64,
        "iv":                 base64.b64encode(text_iv).decode("utf-8"),
        "key_iv":             key_iv_b64,
    }


def decrypt_text(encrypted_content_b64: str,
                 encrypted_file_key_b64: str,
                 iv_b64: str,
                 key_iv_b64: str,
                 user_id: int = None,
                 password_hash: str = None) -> str:
    per_file_key    = decrypt_file_key(encrypted_file_key_b64, key_iv_b64, user_id, password_hash)
    iv              = base64.b64decode(iv_b64)
    encrypted_bytes = base64.b64decode(encrypted_content_b64)
    aesgcm          = AESGCM(per_file_key)
    return aesgcm.decrypt(iv, encrypted_bytes, None).decode("utf-8")


# ─────────────────────────────────────────────────────────────
# ENCRYPT FILE BYTES
# ─────────────────────────────────────────────────────────────
def encrypt_file_bytes(file_bytes: bytes,
                       user_id: int = None,
                       password_hash: str = None) -> dict:
    per_file_key = generate_file_key()

    file_iv = os.urandom(12)
    aesgcm  = AESGCM(per_file_key)
    encrypted_bytes = aesgcm.encrypt(file_iv, file_bytes, None)

    enc_key_b64, key_iv_b64 = encrypt_file_key(per_file_key, user_id, password_hash)

    return {
        "encrypted_bytes":    encrypted_bytes,
        "encrypted_file_key": enc_key_b64,
        "iv":                 base64.b64encode(file_iv).decode("utf-8"),
        "key_iv":             key_iv_b64,
    }


def decrypt_file_bytes(encrypted_bytes: bytes,
                       encrypted_file_key_b64: str,
                       iv_b64: str,
                       key_iv_b64: str,
                       user_id: int = None,
                       password_hash: str = None) -> bytes:
    per_file_key = decrypt_file_key(encrypted_file_key_b64, key_iv_b64, user_id, password_hash)
    iv     = base64.b64decode(iv_b64)
    aesgcm = AESGCM(per_file_key)
    return aesgcm.decrypt(iv, encrypted_bytes, None)