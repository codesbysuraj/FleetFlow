from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

users_bp = Blueprint("users", __name__, url_prefix="/users")
bcrypt = Bcrypt()

VALID_ROLES = {"manager", "dispatcher", "safety", "analyst"}


@users_bp.route("/", methods=["POST"])
@jwt_required()
def add_user():
    """Admin (manager) can add new users with roles"""
    claims = get_jwt()

    if claims["role"] not in ["manager", "admin"]:
        return jsonify({"error": "Unauthorized. Only admins can add users."}), 403

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "Name, email, password, and role are required"}), 400

    if role not in VALID_ROLES:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "User with this email already exists"}), 409

        # Hash password
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

        # Insert user
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
        """, (name, email, password_hash, role))

        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({
            "message": "User created successfully",
            "user_id": user_id,
            "name": name,
            "email": email,
            "role": role
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@users_bp.route("/", methods=["GET"])
@jwt_required()
def get_users():
    """Admin (manager) can view all users"""
    claims = get_jwt()

    if claims["role"] not in ["manager", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(users), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    """Admin (manager) can delete users"""
    claims = get_jwt()

    if claims["role"] not in ["manager", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
