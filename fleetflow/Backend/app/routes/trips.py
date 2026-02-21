from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection
from datetime import datetime

trip_bp = Blueprint("trip", __name__, url_prefix="/trips")


@trip_bp.route("/", methods=["POST"])
@jwt_required()
def create_trip():
    claims = get_jwt()

    if claims["role"] not in ["dispatcher", "manager"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    vehicle_id = data.get("vehicle_id")
    driver_id = data.get("driver_id")
    cargo_weight = data.get("cargo_weight")
    origin = data.get("origin")
    destination = data.get("destination")
    estimated_fuel_cost = data.get("estimated_fuel_cost", 0)

    if not all([vehicle_id, driver_id, cargo_weight, origin, destination]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, max_capacity_kg, status, odometer_reading FROM vehicles WHERE id=%s",
            (vehicle_id,)
        )
        vehicle = cursor.fetchone()

        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        if vehicle["status"] != "available":
            return jsonify({"error": f"Vehicle not available (status: {vehicle['status']})"}), 400

        if cargo_weight > vehicle["max_capacity_kg"]:
            return jsonify({
                "error": f"Cargo weight ({cargo_weight}kg) exceeds vehicle capacity ({vehicle['max_capacity_kg']}kg)"
            }), 400

        cursor.execute(
            "SELECT id, status, license_expiry_date FROM drivers WHERE id=%s",
            (driver_id,)
        )
        driver = cursor.fetchone()

        if not driver:
            return jsonify({"error": "Driver not found"}), 404

        if driver["status"] != "on_duty":
            return jsonify({"error": f"Driver not available (status: {driver['status']})"}), 400

        if driver["license_expiry_date"] < datetime.today().date():
            return jsonify({"error": "Driver license expired"}), 400

        cursor.execute("""
            INSERT INTO trips
            (vehicle_id, driver_id, cargo_weight, origin, destination, start_odometer, status)
            VALUES (%s,%s,%s,%s,%s,%s,'dispatched')
        """, (
            vehicle_id,
            driver_id,
            cargo_weight,
            origin,
            destination,
            vehicle["odometer_reading"]
        ))

        trip_id = cursor.lastrowid

        cursor.execute("UPDATE drivers SET status='on_trip' WHERE id=%s", (driver_id,))
        cursor.execute("UPDATE vehicles SET status='on_trip' WHERE id=%s", (vehicle_id,))

        if estimated_fuel_cost > 0:
            estimated_liters = estimated_fuel_cost / 100
            cursor.execute("""
                INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
                VALUES (%s,%s,%s,%s,CURDATE())
            """, (vehicle_id, trip_id, estimated_liters, estimated_fuel_cost))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Trip dispatched successfully",
            "trip_id": trip_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/", methods=["GET"])
@jwt_required()
def get_trips():
    status = request.args.get("status")

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                t.id, t.cargo_weight, t.origin, t.destination, t.status,
                t.created_at, t.completed_at,
                v.vehicle_type, v.model_name, v.license_plate,
                d.name as driver_name
            FROM trips t
            JOIN vehicles v ON t.vehicle_id = v.id
            JOIN drivers d ON t.driver_id = d.id
        """

        if status:
            query += " WHERE t.status=%s"
            cursor.execute(query, (status,))
        else:
            cursor.execute(query)

        trips = cursor.fetchall()

        for trip in trips:
            if trip.get("created_at"):
                trip["created_at"] = trip["created_at"].isoformat()
            if trip.get("completed_at"):
                trip["completed_at"] = trip["completed_at"].isoformat()

        cursor.close()
        conn.close()

        return jsonify(trips), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/<int:trip_id>", methods=["PUT"])
@jwt_required()
def update_trip(trip_id):
    claims = get_jwt()

    if claims["role"] not in ["dispatcher", "manager"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ["completed", "cancelled"]:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT vehicle_id, driver_id FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        if new_status == "completed":
            cursor.execute("""
                UPDATE trips 
                SET status='completed', completed_at=NOW()
                WHERE id=%s
            """, (trip_id,))
        else:
            cursor.execute("""
                UPDATE trips 
                SET status='cancelled'
                WHERE id=%s
            """, (trip_id,))

        cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s", (trip["driver_id"],))
        cursor.execute("UPDATE vehicles SET status='available' WHERE id=%s", (trip["vehicle_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@trip_bp.route("/<int:trip_id>", methods=["DELETE"])
@jwt_required()
def delete_trip(trip_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT vehicle_id, driver_id FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        cursor.execute("DELETE FROM trips WHERE id=%s", (trip_id,))
        cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s", (trip["driver_id"],))
        cursor.execute("UPDATE vehicles SET status='available' WHERE id=%s", (trip["vehicle_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500