from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.nominee import Nominee
from app.models.user import User
from app.models.vault import VaultItem
from app.services.email_service import send_nominee_access_request
from app.services.encryption_service import decrypt_text, decrypt_file_bytes
from datetime import datetime, timedelta
import os, base64

nominee_bp = Blueprint("nominee", __name__)

def require_role(required_role):
    claims = get_jwt()
    return claims.get("role") == required_role


@nominee_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get nominee profile
    ---
    tags:
      - Nominee
    security:
      - Bearer: []
    responses:
      200:
        description: Nominee profile data
      403:
        description: Access denied
    """
    if not require_role("nominee"):
        return jsonify({"error": "Access denied"}), 403
    nominee_id = int(get_jwt_identity())
    nominee    = Nominee.query.get(nominee_id)
    if not nominee:
        return jsonify({"error": "Nominee not found"}), 404
    data = nominee.to_dict()
    data["user_name"] = nominee.user.name if nominee.user else None
    return jsonify(data), 200


@nominee_bp.route("/request-access", methods=["POST"])
@jwt_required()
def request_access():
    """
    Request vault access (notifies the user via email)
    ---
    tags:
      - Nominee
    security:
      - Bearer: []
    responses:
      200:
        description: Access request sent to vault owner
      403:
        description: Access denied
    """
    if not require_role("nominee"):
        return jsonify({"error": "Access denied"}), 403
    nominee_id = int(get_jwt_identity())
    nominee    = Nominee.query.get(nominee_id)
    if not nominee:
        return jsonify({"error": "Nominee not found"}), 404
    user = nominee.user
    if not user:
        return jsonify({"error": "Associated user not found"}), 404
    if nominee.access_status == "approved":
        return jsonify({"message": "Access already granted", "access_status": "approved"}), 200

    nominee.access_status       = "pending"
    nominee.access_requested_at = datetime.utcnow()
    db.session.commit()

    base_url     = os.getenv("FRONTEND_URL", "http://localhost:3000")
    approve_link = f"{base_url}/user/nominee-access/approve?nominee_id={nominee_id}"
    deny_link    = f"{base_url}/user/nominee-access/deny?nominee_id={nominee_id}"
    try:
        send_nominee_access_request(
            user_email   = user.email,
            user_name    = user.name,
            nominee_name = nominee.name,
            approve_link = approve_link,
            deny_link    = deny_link
        )
    except Exception as e:
        print(f"[EMAIL] {e}")

    return jsonify({
        "message":       "Access request sent to vault owner.",
        "access_status": "pending"
    }), 200


@nominee_bp.route("/verify-access", methods=["POST"])
@jwt_required()
def verify_access():
    """
    Verify emergency code to access vault (after approval or 24hr auto-approval)
    ---
    tags:
      - Nominee
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            emergency_code:
              type: string
              example: EMERG123
    responses:
      200:
        description: Access verified
      403:
        description: Access not granted yet
      425:
        description: Security delay active - wait 30 minutes
    """
    if not require_role("nominee"):
        return jsonify({"error": "Access denied"}), 403
    nominee_id     = int(get_jwt_identity())
    nominee        = Nominee.query.get(nominee_id)
    data           = request.get_json()
    emergency_code = data.get("emergency_code", "")
    if not nominee:
        return jsonify({"error": "Nominee not found"}), 404

    user = nominee.user
    if nominee.access_status == "pending" and nominee.access_requested_at:
        hours_since = (datetime.utcnow() - nominee.access_requested_at).total_seconds() / 3600
        if hours_since >= 24 or user.is_vault_locked:
            nominee.access_status     = "auto_approved"
            nominee.access_granted_at = datetime.utcnow()
            db.session.commit()

    if nominee.access_status not in ["approved", "auto_approved"]:
        return jsonify({
            "error":         "Access not yet granted.",
            "access_status": nominee.access_status
        }), 403

    if not nominee.check_emergency_code(emergency_code):
        return jsonify({"error": "Invalid emergency code"}), 401

    if nominee.access_granted_at:
        minutes_since = (datetime.utcnow() - nominee.access_granted_at).total_seconds() / 60
        if minutes_since < 30:
            remaining = int(30 - minutes_since)
            return jsonify({
                "error":        f"Security delay active. Wait {remaining} more minutes.",
                "wait_minutes": remaining,
            }), 425

    return jsonify({
        "message":       "Access verified. You can now view the vault.",
        "access_status": nominee.access_status
    }), 200


@nominee_bp.route("/vault", methods=["GET"])
@jwt_required()
def view_vault():
    """
    View all vault items (metadata only, no content)
    ---
    tags:
      - Nominee
    security:
      - Bearer: []
    responses:
      200:
        description: List of vault items
      403:
        description: Vault access not granted
    """
    if not require_role("nominee"):
        return jsonify({"error": "Access denied"}), 403
    nominee_id = int(get_jwt_identity())
    nominee    = Nominee.query.get(nominee_id)
    if nominee.access_status not in ["approved", "auto_approved"]:
        return jsonify({"error": "Vault access not granted"}), 403
    items = VaultItem.query.filter_by(user_id=nominee.user_id).all()
    return jsonify({"vault_items": [item.to_dict() for item in items], "total": len(items)}), 200


@nominee_bp.route("/vault/<int:item_id>", methods=["GET"])
@jwt_required()
def view_vault_item(item_id):
    """
    View and decrypt a single vault item
    ---
    tags:
      - Nominee
    security:
      - Bearer: []
    parameters:
      - in: path
        name: item_id
        type: integer
        required: true
        example: 1
    responses:
      200:
        description: Decrypted vault item content
      403:
        description: Vault access not granted
      404:
        description: Item not found
    """
    if not require_role("nominee"):
        return jsonify({"error": "Access denied"}), 403
    nominee_id = int(get_jwt_identity())
    nominee    = Nominee.query.get(nominee_id)
    if nominee.access_status not in ["approved", "auto_approved"]:
        return jsonify({"error": "Vault access not granted"}), 403
    item = VaultItem.query.filter_by(id=item_id, user_id=nominee.user_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404

    iv_parts   = item.iv.split("|")
    content_iv = iv_parts[0]
    key_iv     = iv_parts[1] if len(iv_parts) > 1 else iv_parts[0]

    if item.item_type == "text":
        # plain_text = decrypt_text(item.encrypted_content, item.encrypted_file_key, content_iv, key_iv)
        user = nominee.user
        plain_text = decrypt_text(item.encrypted_content, item.encrypted_file_key, content_iv, key_iv, user_id=user.id, password_hash=user.password_hash)
        return jsonify({**item.to_dict(), "content": plain_text}), 200
    elif item.item_type == "file":
        with open(item.file_path, "rb") as f:
            encrypted_bytes = f.read()
        file_bytes = decrypt_file_bytes(encrypted_bytes, item.encrypted_file_key, content_iv, key_iv, user_id=user.id, password_hash=user.password_hash)
        # file_bytes = decrypt_file_bytes(encrypted_bytes, item.encrypted_file_key, content_iv, key_iv)
        return jsonify({**item.to_dict(), "file_data": base64.b64encode(file_bytes).decode("utf-8"), "mime_type": item.mime_type}), 200
    return jsonify({"error": "Unknown item type"}), 400