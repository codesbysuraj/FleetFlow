from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta
from app.db import get_connection

auth = Blueprint("auth", __name__, url_prefix="/auth")
bcrypt = Bcrypt()

VALID_ROLES = {"manager", "dispatcher", "safety", "analyst"}
ADMIN_EMAIL = "admin@fleetflow.com"
ADMIN_PASSWORD = "admin123"
ADMIN_ROLE = "admin"   


def encode_token(user_id, role):
    return create_access_token(
        identity=str(user_id),
        additional_claims={"role": role},
        expires_delta=timedelta(hours=6)
    )



@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        token = encode_token(user_id=0, role=ADMIN_ROLE)

        return jsonify({
            "message": "Admin login successful",
            "access_token": token,
            "role": ADMIN_ROLE,
            "user_id": 0,
            "name": "System Admin"
        }), 200


   

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid password"}), 401

        token = encode_token(user["id"], user["role"])

        return jsonify({
            "message": "Login successful",
            "access_token": token,
            "role": user["role"],
            "user_id": user["id"],
            "name": user["name"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500