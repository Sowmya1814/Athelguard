from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.vault import VaultItem
from app.models.user import User
from app.services.encryption_service import (
    encrypt_text, encrypt_file_bytes, decrypt_text, decrypt_file_bytes
)
from datetime import datetime
import os, base64, uuid

vault_bp = Blueprint("vault", __name__)

def require_user():
    claims = get_jwt()
    return claims.get("role") == "user"

def get_iv_string(content_iv, key_iv):
    return f"{content_iv}|{key_iv}"

def parse_iv_string(iv_string):
    parts = iv_string.split("|")
    return parts[0], parts[1] if len(parts) > 1 else parts[0]


@vault_bp.route("/upload/text", methods=["POST"])
@jwt_required()
def upload_text():
    if not require_user():
        return jsonify({"error": "Access denied"}), 403

    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data    = request.get_json()
    title   = data.get("title", "").strip()
    content = data.get("content", "").strip()
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    try:
        enc = encrypt_text(
            plain_text    = content,
            user_id       = user_id,
            password_hash = user.password_hash
        )
    except Exception as e:
        return jsonify({"error": f"Encryption failed: {str(e)}"}), 500

    item = VaultItem(
        user_id            = user_id,
        item_type          = "text",
        title              = title,
        encrypted_content  = enc["encrypted_content"],
        encrypted_file_key = enc["encrypted_file_key"],
        iv                 = get_iv_string(enc["iv"], enc["key_iv"]),
    )
    db.session.add(item)
    user.last_active = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Text encrypted and saved successfully",
        "item":    item.to_dict()
    }), 201


@vault_bp.route("/upload/file", methods=["POST"])
@jwt_required()
def upload_file():
    if not require_user():
        return jsonify({"error": "Access denied"}), 403

    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file  = request.files["file"]
    title = request.form.get("title", file.filename).strip()
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_bytes        = file.read()
    original_filename = file.filename
    mime_type         = file.content_type
    file_size         = len(file_bytes)

    try:
        enc = encrypt_file_bytes(
            file_bytes    = file_bytes,
            user_id       = user_id,
            password_hash = user.password_hash
        )
    except Exception as e:
        return jsonify({"error": f"Encryption failed: {str(e)}"}), 500

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    user_folder   = os.path.join(upload_folder, str(user_id))
    os.makedirs(user_folder, exist_ok=True)
    enc_filename  = f"{uuid.uuid4().hex}.enc"
    enc_file_path = os.path.join(user_folder, enc_filename)

    with open(enc_file_path, "wb") as f:
        f.write(enc["encrypted_bytes"])

    item = VaultItem(
        user_id            = user_id,
        item_type          = "file",
        title              = title,
        file_path          = enc_file_path,
        original_filename  = original_filename,
        file_size          = file_size,
        mime_type          = mime_type,
        encrypted_file_key = enc["encrypted_file_key"],
        iv                 = get_iv_string(enc["iv"], enc["key_iv"]),
    )
    db.session.add(item)
    user.last_active = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": f"File '{original_filename}' encrypted and saved",
        "item":    item.to_dict()
    }), 201


@vault_bp.route("/items", methods=["GET"])
@jwt_required()
def list_items():
    if not require_user():
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    items   = VaultItem.query.filter_by(user_id=user_id)\
                             .order_by(VaultItem.created_at.desc()).all()
    return jsonify({
        "vault_items": [item.to_dict() for item in items],
        "total":       len(items)
    }), 200


@vault_bp.route("/items/<int:item_id>", methods=["GET"])
@jwt_required()
def get_item(item_id):
    if not require_user():
        return jsonify({"error": "Access denied"}), 403

    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    item    = VaultItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({"error": "Item not found"}), 404

    content_iv, key_iv = parse_iv_string(item.iv)

    # ── Text item ──────────────────────────────────────────
    if item.item_type == "text":
        try:
            plain_text = decrypt_text(
                encrypted_content_b64  = item.encrypted_content,
                encrypted_file_key_b64 = item.encrypted_file_key,
                iv_b64                 = content_iv,
                key_iv_b64             = key_iv,
                user_id                = user_id,
                password_hash          = user.password_hash
            )
            return jsonify({**item.to_dict(), "content": plain_text}), 200
        except Exception as e:
            return jsonify({"error": f"Decryption failed: {str(e)}"}), 500

    # ── File item ──────────────────────────────────────────
    elif item.item_type == "file":
        # Check file exists on disk
        if not item.file_path or not os.path.exists(item.file_path):
            return jsonify({
                "error": "Encrypted file not found on disk. It may have been deleted or the server path changed."
            }), 404

        try:
            with open(item.file_path, "rb") as f:
                encrypted_bytes = f.read()

            file_bytes = decrypt_file_bytes(
                encrypted_bytes        = encrypted_bytes,
                encrypted_file_key_b64 = item.encrypted_file_key,
                iv_b64                 = content_iv,
                key_iv_b64             = key_iv,
                user_id                = user_id,
                password_hash          = user.password_hash
            )

            return jsonify({
                **item.to_dict(),
                "file_data": base64.b64encode(file_bytes).decode("utf-8"),
                "mime_type": item.mime_type
            }), 200

        except FileNotFoundError:
            return jsonify({"error": "File not found on disk."}), 404
        except Exception as e:
            return jsonify({"error": f"Decryption failed: {str(e)}"}), 500

    return jsonify({"error": "Unknown item type"}), 400


@vault_bp.route("/items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    if not require_user():
        return jsonify({"error": "Access denied"}), 403
    user_id = int(get_jwt_identity())
    item    = VaultItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    if item.item_type == "file" and item.file_path:
        if os.path.exists(item.file_path):
            os.remove(item.file_path)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully"}), 200