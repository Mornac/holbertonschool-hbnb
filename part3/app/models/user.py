from app.models.model import BaseModel
from sqlalchemy.orm import relationship, validates
import re
import uuid
from app import db, bcrypt

regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'


class User(BaseModel, db.Model):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    places = relationship('Place', back_populates='owner', lazy=True)
    reviews = relationship('Review', back_populates='user', lazy=True)

    def hash_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    @validates("first_name")
    def validate_first_name(self, key, first_name):
        if len(first_name) <= 50:
            return first_name
        else:
            raise ValueError

    @validates("last_name")
    def validate_email(self, key, last_name):
        if len(last_name) <= 50:
            return last_name
        else:
            raise ValueError

    @validates("email")
    def validate_email(self, key, email):
        if re.match(regex, email):
            return email
        else:
            raise ValueError
