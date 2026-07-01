from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.models.nominee import Nominee
from datetime import datetime, timedelta

user_bp = Blueprint("user", __name__)

def require_role(required_role):
    claims = get_jwt()
    return claims.get("role") == required_role


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get user profile with nominee info
    ---
    tags:
      - User
    security:
      - Bearer: []
    responses:
      200:
        description: User profile data
      403:
        description: Access denied
    """
    if not require_role("user"):
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = user.to_dict()
    if user.nominee:
        data["nominee"] = user.nominee.to_dict()
    return jsonify(data), 200


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Update user profile
    ---
    tags:
      - User
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
              example: abc Updated
            phone:
              type: string
              example: "9876543210"
            inactivity_days:
              type: integer
              example: 60
    responses:
      200:
        description: Profile updated
      403:
        description: Access denied
    """
    if not require_role("user"):
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    if "name"            in data: user.name            = data["name"]
    if "phone"           in data: user.phone           = data["phone"]
    if "inactivity_days" in data: user.inactivity_days = int(data["inactivity_days"])
    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


@user_bp.route("/vault-status", methods=["GET"])
@jwt_required()
def vault_status():
    """
    Get vault status indicator (Active/Locked + next check-in date)
    ---
    tags:
      - User
    security:
      - Bearer: []
    responses:
      200:
        description: Vault status info
      403:
        description: Access denied
    """
    if not require_role("user"):
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    next_checkin = user.last_active + timedelta(days=user.inactivity_days)
    return jsonify({
        "status":       "Active" if not user.is_vault_locked else "Locked",
        "next_checkin": next_checkin.strftime("%d-%b-%Y"),
        "last_active":  user.last_active.isoformat(),
        "is_locked":    user.is_vault_locked,
    }), 200


@user_bp.route("/nominee/access", methods=["POST"])
@jwt_required()
def handle_access_request():
    """
    Approve or deny nominee vault access request
    ---
    tags:
      - User
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            action:
              type: string
              enum: [approve, deny]
              example: approve
    responses:
      200:
        description: Action completed, nominee notified
      404:
        description: No pending request found
    """
    if not require_role("user"):
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    data    = request.get_json()
    action  = data.get("action")
    nominee = user.nominee
    if not nominee or nominee.access_status != "pending":
        return jsonify({"error": "No pending access request found"}), 404

    from app.services.email_service import send_access_granted, send_access_denied
    if action == "approve":
        nominee.access_status     = "approved"
        nominee.access_granted_at = datetime.utcnow()
        db.session.commit()
        try: send_access_granted(nominee.email, nominee.name, user.name)
        except Exception as e: print(f"[EMAIL] {e}")
        return jsonify({"message": "Access approved. Nominee notified."}), 200
    elif action == "deny":
        nominee.access_status = "denied"
        db.session.commit()
        try: send_access_denied(nominee.email, nominee.name, user.name)
        except Exception as e: print(f"[EMAIL] {e}")
        return jsonify({"message": "Access denied. Nominee notified."}), 200
    return jsonify({"error": "Invalid action. Use 'approve' or 'deny'"}), 400