from flask import Flask,request,jsonify,Blueprint
from app.db import get_connection
from flask_jwt_extended import jwt_required,get_jwt
from datetime import datetime

trip_bp= Blueprint("trip",__name__,url_prefix="/trips")

@trip_bp.route("/", methods=["POST"])
@jwt_required()
def create_trip():
    claims = get_jwt()

    # Only dispatcher or manager
    if claims["role"] not in ["dispatcher", "manager"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    vehicle_id = data.get("vehicle_id")
    driver_id = data.get("driver_id")
    cargo_weight = data.get("cargo_weight")
    origin = data.get("origin")
    destination = data.get("destination")
    revenue = data.get("revenue", 0)

    if not all([vehicle_id, driver_id, cargo_weight, origin, destination]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get vehicle
        cursor.execute("SELECT * FROM vehicles WHERE id=%s", (vehicle_id,))
        vehicle = cursor.fetchone()

        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        if vehicle["status"] != "available":
            return jsonify({"error": "Vehicle not available"}), 400

        if cargo_weight > vehicle["max_capacity_kg"]:
            return jsonify({"error": "Cargo exceeds vehicle capacity"}), 400


        # Get driver
        cursor.execute("SELECT * FROM drivers WHERE id=%s", (driver_id,))
        driver = cursor.fetchone()

        if not driver:
            return jsonify({"error": "Driver not found"}), 404

        if driver["status"] != "on_duty":
            return jsonify({"error": "Driver not available"}), 400

        if driver["license_expiry_date"] < datetime.today().date():
            return jsonify({"error": "Driver license expired"}), 400


        # Insert Trip (default status = dispatched)
        cursor.execute("""
            INSERT INTO trips
            (vehicle_id, driver_id, cargo_weight, origin, destination, status, revenue)
            VALUES (%s,%s,%s,%s,%s,'dispatched',%s)
        """, (vehicle_id, driver_id, cargo_weight, origin, destination, revenue))


        # Update vehicle & driver status
        cursor.execute("UPDATE vehicles SET status='on_trip' WHERE id=%s", (vehicle_id,))
        cursor.execute("UPDATE drivers SET status='on_trip' WHERE id=%s", (driver_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip dispatched successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@trip_bp.route("/", methods=["GET"])
@jwt_required()
def get_trips():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT t.id,
                   v.model_name AS vehicle,
                   d.name AS driver,
                   t.origin,
                   t.destination,
                   t.status,
                   t.cargo_weight
            FROM trips t
            JOIN vehicles v ON t.vehicle_id = v.id
            JOIN drivers d ON t.driver_id = d.id
            ORDER BY t.id DESC
        """)

        trips = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(trips), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@trip_bp.route("/<int:trip_id>/complete", methods=["PUT"])
@jwt_required()
def complete_trip(trip_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get trip
        cursor.execute("SELECT * FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        # Update trip status
        cursor.execute("""
            UPDATE trips 
            SET status='completed', completed_at=NOW()
            WHERE id=%s
        """, (trip_id,))

        # Set vehicle & driver available
        cursor.execute("UPDATE vehicles SET status='available' WHERE id=%s", (trip["vehicle_id"],))
        cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s", (trip["driver_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip completed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@trip_bp.route("/<int:trip_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_trip(trip_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        cursor.execute("""
            UPDATE trips 
            SET status='cancelled'
            WHERE id=%s
        """, (trip_id,))

        cursor.execute("UPDATE vehicles SET status='available' WHERE id=%s", (trip["vehicle_id"],))
        cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s", (trip["driver_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip cancelled"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500