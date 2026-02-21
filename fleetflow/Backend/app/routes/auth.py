from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta
from app.db import get_connection

auth = Blueprint("auth", __name__, url_prefix="/auth")
bcrypt = Bcrypt()

VALID_ROLES = {"manager", "dispatcher", "safety", "analyst"}



@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"error": "Email and password required"}), 400

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

        access_token = create_access_token(
            identity=user["id"],
            additional_claims={"role": user["role"]},
            expires_delta=timedelta(hours=6)
        )

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "role": user["role"],
            "user_id": user["id"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500