"""
AethelGuard TOTP Service
--------------------------
Uses pyotp to generate TOTP secrets and QR codes
compatible with Google Authenticator / Authy.
"""

import pyotp
import qrcode
import io
import base64


def generate_totp_secret() -> str:
    """Generate a new random TOTP secret (base32)."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str, role: str = "user") -> str:
    """
    Build the otpauth:// URI for QR code generation.
    issuer = AetherGuard-User or AetherGuard-Nominee
    """
    issuer = f"AetherGuard-{role.capitalize()}"
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)


def generate_qr_base64(totp_uri: str) -> str:
    """
    Generate a QR code image from the TOTP URI.
    Returns a base64 PNG string → send to frontend to display.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(totp_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def verify_totp(secret: str, token: str) -> bool:
    """
    Verify user-entered OTP against the stored secret.
    valid_window=1 allows 30s clock drift tolerance.
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(token, valid_window=1)
