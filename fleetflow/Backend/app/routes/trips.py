from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection
from datetime import datetime

trip_bp = Blueprint("trip", __name__, url_prefix="/trips")




@trip_bp.route("/", methods=["POST"])
@jwt_required()
def create_trip():
    claims = get_jwt()

    # Dispatchers and managers can create trips
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

        # Check if vehicle exists and get its capacity
        cursor.execute("SELECT max_capacity_kg, vehicle_type FROM vehicles WHERE id=%s", (vehicle_id,))
        vehicle = cursor.fetchone()
        
        if not vehicle:
            return jsonify({"error": "Vehicle not found"}), 404

        # Check if cargo weight exceeds vehicle capacity
        if cargo_weight > vehicle["max_capacity_kg"]:
            return jsonify({
                "error": f"Too heavy! Cargo weight ({cargo_weight}kg) exceeds vehicle capacity ({vehicle['max_capacity_kg']}kg)"
            }), 400

        # Check if driver exists and is available
        cursor.execute("SELECT status, license_category FROM drivers WHERE id=%s", (driver_id,))
        driver = cursor.fetchone()
        
        if not driver:
            return jsonify({"error": "Driver not found"}), 404

        if driver["status"] != "on_duty":
            return jsonify({
                "error": f"Driver is not available. Current status: {driver['status']}"
            }), 400

        # Get vehicle's current odometer reading
        cursor.execute("SELECT odometer_reading FROM vehicles WHERE id=%s", (vehicle_id,))
        vehicle_data = cursor.fetchone()
        start_odometer = vehicle_data["odometer_reading"] if vehicle_data else 0

        # Create the trip
        cursor.execute("""
            INSERT INTO trips 
            (vehicle_id, driver_id, cargo_weight, origin, destination, start_odometer, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'dispatched')
        """, (vehicle_id, driver_id, cargo_weight, origin, destination, start_odometer))

        trip_id = cursor.lastrowid

        # Update driver status to on_trip
        cursor.execute("UPDATE drivers SET status='on_trip' WHERE id=%s", (driver_id,))

        # If estimated fuel cost provided, log it
        if estimated_fuel_cost > 0:
            # Estimate liters (assuming average cost per liter, e.g., 100 rupees/liter)
            estimated_liters = estimated_fuel_cost / 100
            cursor.execute("""
                INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
                VALUES (%s, %s, %s, %s, CURDATE())
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
    status = request.args.get("status")  # Filter by status if provided
    
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Join with vehicles and drivers to get full information
        query = """
            SELECT 
                t.id, t.cargo_weight, t.origin, t.destination, t.status, 
                t.revenue, t.created_at, t.completed_at,
                v.vehicle_type, v.model_name, v.license_plate,
                d.name as driver_name, d.license_number
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

        # Convert datetime objects to strings for JSON serialization
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




@trip_bp.route("/<int:trip_id>", methods=["GET"])
@jwt_required()
def get_trip(trip_id):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.*,
                v.vehicle_type, v.model_name, v.license_plate,
                d.name as driver_name, d.license_number
            FROM trips t
            JOIN vehicles v ON t.vehicle_id = v.id
            JOIN drivers d ON t.driver_id = d.id
            WHERE t.id=%s
        """, (trip_id,))
        
        trip = cursor.fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        # Convert datetime objects to strings
        if trip.get("created_at"):
            trip["created_at"] = trip["created_at"].isoformat()
        if trip.get("completed_at"):
            trip["completed_at"] = trip["completed_at"].isoformat()

        cursor.close()
        conn.close()

        return jsonify(trip), 200

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

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get current trip info
        cursor.execute("SELECT driver_id, status, end_odometer FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()
        
        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        # Update trip status
        if new_status == "completed":
            # Set completed_at timestamp
            cursor.execute("""
                UPDATE trips 
                SET status=%s, completed_at=NOW() 
                WHERE id=%s
            """, (new_status, trip_id))
            
            # Update driver status back to on_duty
            cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s", (trip["driver_id"],))
        else:
            cursor.execute("UPDATE trips SET status=%s WHERE id=%s", (new_status, trip_id))

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

        # Get driver_id before deleting
        cursor.execute("SELECT driver_id FROM trips WHERE id=%s", (trip_id,))
        trip = cursor.fetchone()
        
        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        # Delete the trip
        cursor.execute("DELETE FROM trips WHERE id=%s", (trip_id,))

        # Update driver status back to on_duty if they were on this trip
        cursor.execute("UPDATE drivers SET status='on_duty' WHERE id=%s AND status='on_trip'", (trip["driver_id"],))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Trip deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
