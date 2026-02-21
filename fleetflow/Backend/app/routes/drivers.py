from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.db import get_connection

driver_bp = Blueprint("driver", __name__, url_prefix="/drivers")




@driver_bp.route("/", methods=["POST"])
@jwt_required()
def add_driver():
    claims = get_jwt()

    # Only managers can add drivers
    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    name = data.get("name")
    license_number = data.get("license_number")
    license_category = data.get("license_category")
    license_expiry_date = data.get("license_expiry_date")
    status = data.get("status", "off_duty")
    safety_score = data.get("safety_score", 100)

    if not all([name, license_number, license_category, license_expiry_date]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Check if driver already exists
        cursor.execute("SELECT id FROM drivers WHERE license_number=%s", (license_number,))
        if cursor.fetchone():
            return jsonify({"error": "Driver with this license already exists"}), 409

        cursor.execute("""
            INSERT INTO drivers 
            (name, license_number, license_category, license_expiry_date, status, safety_score)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (name, license_number, license_category, license_expiry_date, status, safety_score))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Driver added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@driver_bp.route("/", methods=["GET"])
@jwt_required()
def get_drivers():
    status = request.args.get("status")  # Filter by status if provided
    
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        if status:
            cursor.execute("SELECT * FROM drivers WHERE status=%s", (status,))
        else:
            cursor.execute("SELECT * FROM drivers")
        
        drivers = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(drivers), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@driver_bp.route("/available", methods=["GET"])
@jwt_required()
def get_available_drivers():
    """Get drivers that are on_duty and not on_trip"""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM drivers WHERE status='on_duty'")
        drivers = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(drivers), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@driver_bp.route("/<int:driver_id>", methods=["PUT"])
@jwt_required()
def update_driver(driver_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Check if driver exists
        cursor.execute("SELECT id FROM drivers WHERE id=%s", (driver_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Driver not found"}), 404

        # Build dynamic update query
        update_fields = []
        values = []
        
        if "name" in data:
            update_fields.append("name=%s")
            values.append(data["name"])
        if "license_category" in data:
            update_fields.append("license_category=%s")
            values.append(data["license_category"])
        if "license_expiry_date" in data:
            update_fields.append("license_expiry_date=%s")
            values.append(data["license_expiry_date"])
        if "status" in data:
            update_fields.append("status=%s")
            values.append(data["status"])
        if "safety_score" in data:
            update_fields.append("safety_score=%s")
            values.append(data["safety_score"])

        if not update_fields:
            return jsonify({"error": "No fields to update"}), 400

        values.append(driver_id)
        query = f"UPDATE drivers SET {', '.join(update_fields)} WHERE id=%s"

        cursor.execute(query, tuple(values))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Driver updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@driver_bp.route("/<int:driver_id>", methods=["DELETE"])
@jwt_required()
def delete_driver(driver_id):
    claims = get_jwt()

    if claims["role"] != "manager":
        return jsonify({"error": "Unauthorized"}), 403

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM drivers WHERE id=%s", (driver_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Driver not found"}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Driver deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
