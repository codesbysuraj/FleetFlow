from flask import Flask
from flask_cors import CORS
from app.routes.auth import auth
from app import db
from app.config import Config
from flask_jwt_extended import jwt_manager
from app.routes.trips import trip_bp
from app.routes.vehical_Reg import vehicle_bp
from app.routes.drivers import driver_bp
# from app.routes.ai import ai
jwt=jwt_manager()
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    jwt.init_app(app)
    app.register_blueprint(auth)
    app.register_blueprint(trip_bp)
    app.register_blueprint(vehicle_bp) 
    app.register_blueprint(driver_bp)  
    return app 