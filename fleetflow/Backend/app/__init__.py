from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.routes.auth import auth
from app import db
from app.config import Config
# from app.routes.user_dashboard import dashboard
# from app.routes.ai import ai
# from app.routes.admin_dashboard import admin

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    app.register_blueprint(auth)
    # app.register_blueprint(dashboard)
    # app.register_blueprint(ai) 
    # app.register_blueprint(admin)  
    return app 