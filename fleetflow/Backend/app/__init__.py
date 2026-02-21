from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    jwt.init_app(app)

    from app.routes.auth import auth
    from app.routes.vehicle_Reg import vehicle_bp
    from app.routes.trips import trip_bp
    from app.routes.drivers import driver_bp
    from app.routes.maintenance import maintenance_bp
    from app.routes.expense import expense_bp
    from app.routes.analytics import analytics_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth)
    app.register_blueprint(vehicle_bp)
    app.register_blueprint(trip_bp)
    app.register_blueprint(driver_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(users_bp)

    return app 