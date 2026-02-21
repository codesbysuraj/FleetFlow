from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

maintenance_bp = Blueprint("maintenance", __name__, url_prefix="/maintenance")

@maintenance_bp.route("/", methods=["POST"])
@jwt_required()
def create_service():
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    vehicle_id = data.get("vehicle_id")
    service_type = data.get("service_type")
    cost = data.get("cost", 0)

    if not vehicle_id or not service_type:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Check vehicle
        cursor.execute("SELECT * FROM vehicles WHERE id=%s", (vehicle_id,))
        vehicle = cursor.fetchone()

        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        if vehicle["status"] == "retired":
            return jsonify({"error": "Vehicle retired"}), 400

        cursor.execute("""
            INSERT INTO maintenance_logs
            (vehicle_id, service_type, cost, service_date, status)
            VALUES (%s,%s,%s,CURDATE(),'new')
        """, (vehicle_id, service_type, cost))

      
        cursor.execute("""
            UPDATE vehicles
            SET status='in_shop'
            WHERE id=%s
        """, (vehicle_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Service log created",
            "vehicle_status": "in_shop"
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@maintenance_bp.route("/", methods=["GET"])
@jwt_required()
def get_service_logs():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT m.id,
                   v.model_name AS vehicle,
                   m.service_type,
                   m.service_date,
                   m.cost,
                   m.status
            FROM maintenance_logs m
            JOIN vehicles v ON m.vehicle_id = v.id
            ORDER BY m.id DESC
        """)

        logs = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(logs), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@maintenance_bp.route("/<int:log_id>/status", methods=["PUT"])
@jwt_required()
def update_service_status(log_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["new", "in_progress", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM maintenance_logs WHERE id=%s", (log_id,))
        log = cursor.fetchone()

        if not log:
            return jsonify({"error": "Service log not found"}), 404

        cursor.execute("""
            UPDATE maintenance_logs
            SET status=%s
            WHERE id=%s
        """, (new_status, log_id))

      
        if new_status == "completed":
            cursor.execute("""
                UPDATE vehicles
                SET status='available'
                WHERE id=%s
            """, (log["vehicle_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Service status updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500