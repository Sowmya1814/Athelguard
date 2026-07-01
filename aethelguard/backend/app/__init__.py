from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import os

# ─── Extensions (created here, initialized in create_app) ───
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
scheduler = BackgroundScheduler()



def create_app():
    app = Flask(__name__)

    # ─── Load Config ────────────────────────────────────────
    from app.config import Config
    app.config.from_object(Config)

    # ─── Create upload folder if not exists ─────────────────
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ─── Init Extensions ────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    
    CORS(app, origins=["http://localhost:3000"]) #connects react frontend

    # ─── Register Models (so migrate can detect them) ────────
    with app.app_context():
        from app.models import user, nominee, vault  # noqa: F401

    # ─── Register Blueprints (Routes) ───────────────────────
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.nominee import nominee_bp
    from app.routes.admin import admin_bp
    from app.routes.vault import vault_bp

    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(user_bp,    url_prefix="/api/user")
    app.register_blueprint(nominee_bp, url_prefix="/api/nominee")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(vault_bp,   url_prefix="/api/vault")

    # ─── Start Inactivity Scheduler ─────────────────────────
    from app.services.inactivity_service import check_inactivity
    if not scheduler.running:
        scheduler.add_job(
            func=check_inactivity,
            args=[app],
            trigger="interval",
            hours=12,           # runs every 12 hours
            id="inactivity_check",
            replace_existing=True
        )
        scheduler.start()

    # ─── Health Check Route ──────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "AetherGuard backend is running ✅"}, 200

    return app