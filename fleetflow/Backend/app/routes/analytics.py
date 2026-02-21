from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

analytics_bp = Blueprint("analytics", __name__, url_prefix="/analytics")


@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard_kpis():
    claims = get_jwt()

    if claims["role"] not in ["manager", "analyst"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS active FROM vehicles WHERE status='on_trip'")
        active = cursor.fetchone()["active"]

        cursor.execute("SELECT COUNT(*) AS in_shop FROM vehicles WHERE status='in_shop'")
        in_shop = cursor.fetchone()["in_shop"]

        cursor.execute("SELECT COUNT(*) AS total FROM vehicles")
        total = cursor.fetchone()["total"]

        utilization_rate = (active / total * 100) if total > 0 else 0

        cursor.execute("SELECT IFNULL(SUM(cost),0) AS fuel FROM fuel_logs")
        fuel = cursor.fetchone()["fuel"]

        cursor.execute("SELECT IFNULL(SUM(cost),0) AS maintenance FROM maintenance_logs")
        maintenance = cursor.fetchone()["maintenance"]

        total_cost = fuel + maintenance

        cursor.close()
        conn.close()

        return jsonify({
            "active_fleet": active,
            "maintenance_alerts": in_shop,
            "utilization_rate": round(utilization_rate, 2),
            "total_operational_cost": total_cost
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/vehicle/<int:vehicle_id>/roi", methods=["GET"])
@jwt_required()
def vehicle_roi(vehicle_id):
    claims = get_jwt()

    if claims["role"] not in ["manager", "analyst"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT acquisition_cost
            FROM vehicles
            WHERE id=%s
        """, (vehicle_id,))
        vehicle = cursor.fetchone()

        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        acquisition = vehicle["acquisition_cost"]

        cursor.execute("""
            SELECT IFNULL(SUM(revenue),0) AS revenue
            FROM trips
            WHERE vehicle_id=%s AND status='completed'
        """, (vehicle_id,))
        revenue = cursor.fetchone()["revenue"]

        cursor.execute("""
            SELECT IFNULL(SUM(cost),0) AS fuel
            FROM fuel_logs
            WHERE vehicle_id=%s
        """, (vehicle_id,))
        fuel = cursor.fetchone()["fuel"]

        cursor.execute("""
            SELECT IFNULL(SUM(cost),0) AS maintenance
            FROM maintenance_logs
            WHERE vehicle_id=%s
        """, (vehicle_id,))
        maintenance = cursor.fetchone()["maintenance"]

        total_expense = fuel + maintenance

        roi = ((revenue - total_expense) / acquisition) * 100 if acquisition > 0 else 0

        cursor.close()
        conn.close()

        return jsonify({
            "vehicle_id": vehicle_id,
            "revenue": revenue,
            "total_expense": total_expense,
            "roi_percent": round(roi, 2)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500