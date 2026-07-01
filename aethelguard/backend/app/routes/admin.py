from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.models.nominee import Nominee

admin_bp = Blueprint("admin", __name__)

def require_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    """
    List all users and their nominees
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: List of all users with nominee info
      403:
        description: Admin access required
    """
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403
    users  = User.query.filter_by(role="user").all()
    result = []
    for user in users:
        u = user.to_dict()
        u["nominee"] = user.nominee.to_dict() if user.nominee else None
        result.append(u)
    return jsonify({"users": result, "total": len(result)}), 200


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    """
    Get single user details (admin cannot see file contents)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        example: 1
    responses:
      200:
        description: User details with nominee
      404:
        description: User not found
    """
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = user.to_dict()
    data["nominee"] = user.nominee.to_dict() if user.nominee else None
    return jsonify(data), 200


@admin_bp.route("/users/<int:user_id>/status", methods=["PUT"])
@jwt_required()
def toggle_status(user_id):
    """
    Activate or deactivate a user account
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            action:
              type: string
              enum: [activate, deactivate]
              example: deactivate
    responses:
      200:
        description: Account status updated
      400:
        description: Invalid action
    """
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data   = request.get_json()
    action = data.get("action")
    if action == "deactivate":
        user.is_active = False
        db.session.commit()
        return jsonify({"message": f"User {user.email} deactivated."}), 200
    elif action == "activate":
        user.is_active = True
        db.session.commit()
        return jsonify({"message": f"User {user.email} activated."}), 200
    return jsonify({"error": "Invalid action. Use 'activate' or 'deactivate'"}), 400


@admin_bp.route("/users/<int:user_id>/reset-mfa", methods=["PUT"])
@jwt_required()
def reset_mfa(user_id):
    """
    Reset MFA for user or nominee (when they lose their phone)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            role:
              type: string
              enum: [user, nominee]
              example: user
    responses:
      200:
        description: MFA reset successful
      404:
        description: User or nominee not found
    """
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    role = data.get("role", "user")
    if role == "user":
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.totp_secret     = None
        user.is_totp_enabled = False
        user.is_active       = False
        db.session.commit()
        return jsonify({"message": f"MFA reset for {user.email}. They must re-register TOTP."}), 200
    elif role == "nominee":
        nominee = Nominee.query.filter_by(user_id=user_id).first()
        if not nominee:
            return jsonify({"error": "Nominee not found"}), 404
        nominee.totp_secret     = None
        nominee.is_totp_enabled = False
        nominee.is_registered   = False
        db.session.commit()
        return jsonify({"message": f"MFA reset for nominee {nominee.email}."}), 200
    return jsonify({"error": "Invalid role"}), 400


@admin_bp.route("/profile", methods=["GET"])
@jwt_required()
def admin_profile():
    """
    Get admin profile
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: Admin profile data
      403:
        description: Admin access required
    """
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403
    admin_id = int(get_jwt_identity())
    admin    = User.query.get(admin_id)
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify(admin.to_dict()), 200