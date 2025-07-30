from flask import Flask
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

bcrypt = Bcrypt()
jwt = JWTManager()
db = SQLAlchemy()

from flask_restx import Api
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns


def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:8000", "http://127.0.0.1:8000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    api_rest = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/api/v1/')

    api_rest.add_namespace(users_ns, path='/api/v1/users')
    api_rest.add_namespace(amenities_ns, path='/api/v1/places')
    api_rest.add_namespace(places_ns, path='/api/v1/places')
    api_rest.add_namespace(reviews_ns, path='/api/v1/reviews')
    api_rest.add_namespace(auth_ns, path='/api/v1/auth')

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    return app
