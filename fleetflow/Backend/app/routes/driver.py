from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection
from datetime import datetime

driver_bp = Blueprint("driver", __name__, url_prefix="/drivers")


@driver_bp.route("/", methods=["GET"])
@jwt_required()
def get_drivers():
    claims = get_jwt()

    if claims["role"] not in ["manager", "safety"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                d.id,
                d.name,
                d.license_number,
                d.license_expiry_date,
                d.status,
                COUNT(t.id) AS total_trips,
                SUM(CASE WHEN t.status='completed' THEN 1 ELSE 0 END) AS completed_trips
            FROM drivers d
            LEFT JOIN trips t ON d.id = t.driver_id
            GROUP BY d.id
        """)

        drivers = cursor.fetchall()

        for driver in drivers:
            total = driver["total_trips"] or 0
            completed = driver["completed_trips"] or 0

            completion_rate = (completed / total * 100) if total > 0 else 0
            safety_score = max(100 - (total - completed) * 5, 50)

            driver["completion_rate"] = round(completion_rate, 2)
            driver["safety_score"] = round(safety_score, 2)

            if driver["license_expiry_date"] and driver["license_expiry_date"] < datetime.today().date():
                driver["status"] = "suspended"

        cursor.close()
        conn.close()

        return jsonify(drivers), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@driver_bp.route("/<int:driver_id>/status", methods=["PUT"])
@jwt_required()
def update_driver_status(driver_id):
    claims = get_jwt()

    if claims["role"] not in ["manager", "safety"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["on_duty", "off_duty", "suspended"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE drivers SET status=%s WHERE id=%s", (new_status, driver_id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Driver status updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500