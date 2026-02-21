from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

vehicle_bp = Blueprint("vehicle", __name__, url_prefix="/vehicles")




@vehicle_bp.route("/", methods=["POST"])
@jwt_required()
def add_vehicle():
    claims = get_jwt()


    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    model = data.get("model_name")
    license_plate = data.get("license_plate")
    vehicle_type = data.get("vehicle_type")
    required_license = data.get("required_license_category")
    max_capacity = data.get("max_capacity_kg")
    odometer = data.get("odometer_reading", 0)
    acquisition_cost = data.get("acquisition_cost", 0)

    if not all([model, license_plate, vehicle_type, required_license, max_capacity]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

    
        cursor.execute("SELECT id FROM vehicles WHERE license_plate=%s", (license_plate,))
        if cursor.fetchone():
            return jsonify({"error": "Vehicle already exists"}), 409

        cursor.execute("""
            INSERT INTO vehicles 
            (model_name, license_plate, vehicle_type, required_license_category,
             max_capacity_kg, odometer_reading, acquisition_cost)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (model, license_plate, vehicle_type, required_license,
              max_capacity, odometer, acquisition_cost))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Vehicle added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@vehicle_bp.route("/", methods=["GET"])
@jwt_required()
def get_vehicles():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM vehicles")
        vehicles = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(vehicles), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@vehicle_bp.route("/<int:vehicle_id>", methods=["PUT"])
@jwt_required()
def update_vehicle(vehicle_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE vehicles
            SET model_name=%s,
                vehicle_type=%s,
                max_capacity_kg=%s,
                odometer_reading=%s
            WHERE id=%s
        """, (
            data.get("model_name"),
            data.get("vehicle_type"),
            data.get("max_capacity_kg"),
            data.get("odometer_reading"),
            vehicle_id
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Vehicle updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vehicle_bp.route("/<int:vehicle_id>", methods=["DELETE"])
@jwt_required()
def delete_vehicle(vehicle_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM vehicles WHERE id=%s", (vehicle_id,))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Vehicle deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500