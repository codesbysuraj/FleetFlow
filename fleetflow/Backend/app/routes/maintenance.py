from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

maintenance_bp = Blueprint("maintenance", __name__, url_prefix="/maintenance")

@maintenance_bp.route("/", methods=["POST"])
@jwt_required()
def add_maintenance():
    claims = get_jwt()
    if claims["role"] not in ["manager", "dispatcher"]:
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    vehicle_id = data.get("vehicle_id")
    issue_service = data.get("issue_service")
    date = data.get("date")
    cost = data.get("cost", 0)
    if not all([vehicle_id, issue_service, date]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Insert maintenance log
        cursor.execute("""
            INSERT INTO maintenance_logs (vehicle_id, service_type, service_date, cost, description)
            VALUES (%s, %s, %s, %s, %s)
        """, (vehicle_id, issue_service, date, cost, issue_service))
        # Mark vehicle as 'in_shop'
        cursor.execute("UPDATE vehicles SET status='in_shop' WHERE id=%s", (vehicle_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Maintenance log added and vehicle marked as in shop"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@maintenance_bp.route("/", methods=["GET"])
@jwt_required()
def get_maintenance_logs():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT m.id, v.license_plate, v.model_name, m.service_type, m.service_date, m.cost, v.status
            FROM maintenance_logs m
            JOIN vehicles v ON m.vehicle_id = v.id
            ORDER BY m.service_date DESC, m.id DESC
        """)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
