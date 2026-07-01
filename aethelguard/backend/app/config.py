import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # ─── Database ───────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # ─── Mail ───────────────────────────────────────────────
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME")

    # ─── Encryption ─────────────────────────────────────────
    MASTER_AES_KEY = os.getenv("MASTER_AES_KEY")

    # ─── File Upload ────────────────────────────────────────
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB max upload

    # ─── App ────────────────────────────────────────────────
    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
