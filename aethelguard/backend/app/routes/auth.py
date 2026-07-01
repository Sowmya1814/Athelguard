from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.models.nominee import Nominee
from app.services.totp_service import generate_totp_secret, get_totp_uri, generate_qr_base64, verify_totp
from app.services.email_service import send_nominee_invite, send_password_reset
from app.services.inactivity_service import confirm_alive
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime, timedelta
import secrets, os

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register/user", methods=["POST"])
def register_user_step1():
    """
    Register a new user with nominee details
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - age
            - password
            - phone
            - inactivity_days
            - nominee
          properties:
            name:
              type: string
              example: Rames
            email:
              type: string
              example: rames@gmail.com
            age:
              type: integer
              example: 21
            password:
              type: string
              example: Abc@1234
            phone:
              type: string
              example: "9876543210"
            inactivity_days:
              type: integer
              example: 30
            nominee:
              type: object
              properties:
                name:
                  type: string
                  example: abc
                email:
                  type: string
                  example: abc@gmail.com
                phone:
                  type: string
                  example: "9123456789"
                relationship:
                  type: string
                  example: Sister
                emergency_code:
                  type: string
                  example: EMERG123
    responses:
      201:
        description: User registered. Returns QR code for TOTP setup.
      400:
        description: Missing required fields
      409:
        description: Email already registered
    """
    data = request.get_json()
    required = ["name", "email", "age", "password", "phone", "inactivity_days", "nominee"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    nom = data["nominee"]
    nominee_required = ["name", "email", "phone", "relationship", "emergency_code"]
    for field in nominee_required:
        if field not in nom:
            return jsonify({"error": f"Missing nominee field: {field}"}), 400

    # if Nominee.query.filter_by(email=nom["email"]).first():
    #     return jsonify({"error": "Nominee email already registered"}), 409

    try:
        user = User(
            name            = data["name"],
            email           = data["email"].strip().lower(),
            age             = int(data["age"]),
            phone           = data["phone"],
            inactivity_days = int(data["inactivity_days"]),
            role            = "user",
            is_active       = False,
        )
        user.set_password(data["password"])
        totp_secret      = generate_totp_secret()
        user.totp_secret = totp_secret
        db.session.add(user)
        db.session.flush()

        reg_token = secrets.token_urlsafe(32)
        nominee = Nominee(
            user_id            = user.id,
            name               = nom["name"],
            email              = nom["email"].strip().lower(),
            phone              = nom["phone"],
            relationship       = nom["relationship"],
            is_registered      = False,
            registration_token = reg_token,
            token_expiry       = datetime.utcnow() + timedelta(hours=24),
            access_status      = "none",
        )
        nominee.set_emergency_code(nom["emergency_code"])
        db.session.add(nominee)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

    base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reg_link = f"{base_url}/register/nominee?token={reg_token}"
    try:
        send_nominee_invite(
            nominee_email     = nom["email"],
            nominee_name      = nom["name"],
            user_name         = data["name"],
            registration_link = reg_link,
            emergency_code    = nom["emergency_code"]
        )
    except Exception as e:
        print(f"[EMAIL] Failed: {e}")

    totp_uri = get_totp_uri(totp_secret, data["email"], "user")
    qr_b64   = generate_qr_base64(totp_uri)

    return jsonify({
        "message":     "Scan QR code with Google Authenticator then submit OTP",
        "user_id":     user.id,
        "qr_code":     qr_b64,
        "totp_secret": totp_secret,
    }), 201


@auth_bp.route("/register/user/totp", methods=["POST"])
def register_user_step2():
    """
    Verify TOTP to activate user account
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              example: 1
            totp_token:
              type: string
              example: "123456"
    responses:
      200:
        description: Registration complete
      400:
        description: Invalid OTP
    """
    data    = request.get_json()
    user_id = data.get("user_id")
    token   = data.get("totp_token")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not verify_totp(user.totp_secret, token):
        return jsonify({"error": "Invalid OTP. Try again."}), 400

    user.is_totp_enabled = True
    user.is_active       = True
    user.last_active     = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Registration complete! You can now log in."}), 200


@auth_bp.route("/register/nominee", methods=["POST"])
def register_nominee_step1():
    """
    Nominee completes registration via email link
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            token:
              type: string
              example: abc123token
            emergency_code:
              type: string
              example: EMERG123
            password:
              type: string
              example: NomPass@123
    responses:
      200:
        description: Returns QR code for nominee TOTP setup
      400:
        description: Invalid token or emergency code
    """
    data  = request.get_json()
    token = data.get("token")

    nominee = Nominee.query.filter_by(registration_token=token).first()
    if not nominee:
        return jsonify({"error": "Invalid or expired registration link"}), 404
    if datetime.utcnow() > nominee.token_expiry:
        return jsonify({"error": "Registration link has expired"}), 400
    if not nominee.check_emergency_code(data.get("emergency_code", "")):
        return jsonify({"error": "Invalid emergency code"}), 400

    nominee.set_password(data["password"])
    totp_secret         = generate_totp_secret()
    nominee.totp_secret = totp_secret
    db.session.commit()

    totp_uri = get_totp_uri(totp_secret, nominee.email, "nominee")
    qr_b64   = generate_qr_base64(totp_uri)

    return jsonify({
        "message":     "Scan QR code then submit OTP",
        "nominee_id":  nominee.id,
        "qr_code":     qr_b64,
        "totp_secret": totp_secret,
    }), 200


@auth_bp.route("/register/nominee/totp", methods=["POST"])
def register_nominee_step2():
    """
    Verify TOTP to activate nominee account
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            nominee_id:
              type: integer
              example: 1
            totp_token:
              type: string
              example: "123456"
    responses:
      200:
        description: Nominee registration complete
      400:
        description: Invalid OTP
    """
    data       = request.get_json()
    nominee_id = data.get("nominee_id")
    token      = data.get("totp_token")

    nominee = Nominee.query.get(nominee_id)
    if not nominee:
        return jsonify({"error": "Nominee not found"}), 404
    if not verify_totp(nominee.totp_secret, token):
        return jsonify({"error": "Invalid OTP. Try again."}), 400

    nominee.is_totp_enabled    = True
    nominee.is_registered      = True
    nominee.registration_token = None
    db.session.commit()
    return jsonify({"message": "Nominee registration complete! You can now log in."}), 200


@auth_bp.route("/login", methods=["POST"])
def login_step1():
    """
    Login Step 1 - Verify email, password and role
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: abc@gmail.com
            password:
              type: string
              example: Abc@1234
            role:
              type: string
              enum: [user, nominee, admin]
              example: user
    responses:
      200:
        description: Credentials verified - proceed to TOTP
      401:
        description: Invalid credentials
      403:
        description: Account not active
    """
    data  = request.get_json()
    email = data.get("email", "").strip().lower()
    pwd   = data.get("password", "")
    role  = data.get("role", "user")

    if role in ["admin", "user"]:
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(pwd):
            return jsonify({"error": "Invalid credentials"}), 401
        if not user.is_active:
            return jsonify({"error": "Account is not active"}), 403
        if user.role != role:
            return jsonify({"error": f"This account is not a {role}"}), 403
        return jsonify({
            "message": "Credentials verified. Enter your TOTP code.",
            "user_id": user.id,
            "role":    role,
        }), 200

    elif role == "nominee":
        nominee = Nominee.query.filter_by(email=email).first()
        if not nominee or not nominee.check_password(pwd):
            return jsonify({"error": "Invalid credentials"}), 401
        if not nominee.is_registered:
            return jsonify({"error": "Please complete nominee registration first"}), 403
        return jsonify({
            "message":    "Credentials verified. Enter your TOTP code.",
            "nominee_id": nominee.id,
            "role":       "nominee",
        }), 200

    return jsonify({"error": "Invalid role"}), 400


@auth_bp.route("/login/totp", methods=["POST"])
def login_step2():
    """
    Login Step 2 - Verify TOTP and get JWT token
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            user_id:
              type: integer
              example: 1
            totp_token:
              type: string
              example: "123456"
            role:
              type: string
              enum: [user, nominee, admin]
              example: user
    responses:
      200:
        description: Returns JWT access token and user info
      400:
        description: Invalid OTP
    """
    data       = request.get_json()
    role       = data.get("role", "user")
    totp_token = data.get("totp_token", "")

    if role in ["user", "admin"]:
        user = User.query.get(data.get("user_id"))
        if not user:
            return jsonify({"error": "User not found"}), 404
        if not verify_totp(user.totp_secret, totp_token):
            return jsonify({"error": "Invalid OTP"}), 400

        user.last_login  = datetime.utcnow()
        user.last_active = datetime.utcnow()
        db.session.commit()

        access_token  = create_access_token(identity=str(user.id),
                                            additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({
            "access_token":  access_token,
            "refresh_token": refresh_token,
            "role":          user.role,
            "user":          user.to_dict(),
        }), 200

    elif role == "nominee":
        nominee = Nominee.query.get(data.get("nominee_id"))
        if not nominee:
            return jsonify({"error": "Nominee not found"}), 404
        if not verify_totp(nominee.totp_secret, totp_token):
            return jsonify({"error": "Invalid OTP"}), 400

        access_token  = create_access_token(identity=str(nominee.id),
                                            additional_claims={"role": "nominee"})
        refresh_token = create_refresh_token(identity=str(nominee.id))
        return jsonify({
            "access_token":  access_token,
            "refresh_token": refresh_token,
            "role":          "nominee",
            "nominee":       nominee.to_dict(),
        }), 200

    return jsonify({"error": "Invalid role"}), 400


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    Send password reset link to email
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: abc@gmail.com
    responses:
      200:
        description: Reset link sent if email exists
    """
    data  = request.get_json()
    email = data.get("email", "").strip().lower()
    user  = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "If this email exists, a reset link has been sent."}), 200

    token = secrets.token_urlsafe(32)
    user.registration_token = token
    user.token_expiry        = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()

    base_url   = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{base_url}/reset-password?token={token}"
    try:
        send_password_reset(email=user.email, name=user.name, reset_link=reset_link)
    except Exception as e:
        print(f"[EMAIL] Reset email failed: {e}")

    return jsonify({"message": "If this email exists, a reset link has been sent."}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """
    Reset password using token from email
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            token:
              type: string
              example: abc123resettoken
            password:
              type: string
              example: NewPass@1234
    responses:
      200:
        description: Password reset successful
      400:
        description: Invalid or expired token
    """
    data     = request.get_json()
    token    = data.get("token")
    new_pass = data.get("password")

    user = User.query.filter_by(registration_token=token).first()
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400
    if datetime.utcnow() > user.token_expiry:
        return jsonify({"error": "Token has expired"}), 400

    user.set_password(new_pass)
    user.registration_token = None
    user.token_expiry        = None
    db.session.commit()
    return jsonify({"message": "Password reset successful! Please log in."}), 200


@auth_bp.route("/checkin/confirm", methods=["GET"])
def checkin_confirm():
    """
    User confirms they are alive (from email link)
    ---
    tags:
      - Auth
    parameters:
      - in: query
        name: user_id
        type: integer
        required: true
        example: 1
    responses:
      200:
        description: Check-in confirmed
    """
    user_id = request.args.get("user_id", type=int)
    if confirm_alive(user_id):
        return jsonify({"message": "Check-in confirmed! Your vault remains secure."}), 200
    return jsonify({"error": "User not found"}), 404


@auth_bp.route("/checkin/deny", methods=["GET"])
def checkin_deny():
    """
    User ignores or denies the alive check
    ---
    tags:
      - Auth
    responses:
      200:
        description: Noted
    """
    return jsonify({"message": "Noted. Your inactivity timer continues."}), 200