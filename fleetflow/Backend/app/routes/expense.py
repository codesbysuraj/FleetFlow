from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

expense_bp = Blueprint("expense", __name__, url_prefix="/expenses")


@expense_bp.route("/", methods=["POST"])
@jwt_required()
def add_expense():
    claims = get_jwt()

    if claims["role"] not in ["manager", "analyst"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    trip_id = data.get("trip_id")
    fuel_cost = data.get("fuel_cost", 0)
    misc_expense = data.get("misc_expense", 0)

    if not trip_id:
        return jsonify({"error": "Trip ID required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT t.id, t.vehicle_id, t.status
            FROM trips t
            WHERE t.id=%s
        """, (trip_id,))
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        if trip["status"] != "completed":
            return jsonify({"error": "Trip must be completed before logging expenses"}), 400

        vehicle_id = trip["vehicle_id"]

        if fuel_cost > 0:
            estimated_liters = fuel_cost / 100
            cursor.execute("""
                INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
                VALUES (%s,%s,%s,%s,CURDATE())
            """, (vehicle_id, trip_id, estimated_liters, fuel_cost))

        if misc_expense > 0:
            cursor.execute("""
                INSERT INTO maintenance_logs
                (vehicle_id, service_type, cost, service_date)
                VALUES (%s,'Misc Expense',%s,CURDATE())
            """, (vehicle_id, misc_expense))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Expense logged successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@expense_bp.route("/vehicle/<int:vehicle_id>", methods=["GET"])
@jwt_required()
def get_vehicle_total_cost(vehicle_id):
    claims = get_jwt()

    if claims["role"] not in ["manager", "analyst"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT IFNULL(SUM(cost),0) as total_fuel
            FROM fuel_logs
            WHERE vehicle_id=%s
        """, (vehicle_id,))
        fuel = cursor.fetchone()["total_fuel"]

        cursor.execute("""
            SELECT IFNULL(SUM(cost),0) as total_maintenance
            FROM maintenance_logs
            WHERE vehicle_id=%s
        """, (vehicle_id,))
        maintenance = cursor.fetchone()["total_maintenance"]

        total_cost = fuel + maintenance

        cursor.close()
        conn.close()

        return jsonify({
            "vehicle_id": vehicle_id,
            "total_fuel_cost": fuel,
            "total_maintenance_cost": maintenance,
            "total_operational_cost": total_cost
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@expense_bp.route("/trip/<int:trip_id>", methods=["GET"])
@jwt_required()
def get_trip_expense(trip_id):
    claims = get_jwt()

    if claims["role"] not in ["manager", "analyst"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT IFNULL(SUM(cost),0) as fuel_cost
            FROM fuel_logs
            WHERE trip_id=%s
        """, (trip_id,))
        fuel = cursor.fetchone()["fuel_cost"]

        cursor.close()
        conn.close()

        return jsonify({
            "trip_id": trip_id,
            "fuel_cost": fuel
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500