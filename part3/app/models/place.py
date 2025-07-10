from app.models.model import db, BaseModel
from sqlalchemy.orm import relationship
from app import db

place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)


class Place(BaseModel):
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    rooms = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    surface = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    reviews = relationship('Review', backref='places', lazy=True)
    amenities = relationship('Amenity', secondary=place_amenity, lazy='subquery', backref=db.backref('places', lazy=True))

    def __repr__(self):
        return (f"<Place {self.id} - {self.title}>")
    
    def add_review(self, review):
        self.reviews.append(review)

    def add_amenity(self, amenity):
        self.amenities.append(amenity)

    """
    def __init__(self, title, price, latitude, longitude, owner_id, rooms, owner, description=None, capacity=0, surface=0, amenities=[], reviews=[]):
        super().__init__()

        if title is not None and 0 < len(title) <= 100:
            self.__title = title
        else:
            raise ValueError
        self.description = description
        if price is not None and price >= 0:
            self.__price = price
        else:
            raise ValueError
        if latitude is not None and -90.0 <= latitude <= 90.0:
            self.__latitude = latitude
        else:
            raise ValueError
        if longitude is not None and -180.0 <= longitude <= 180.0:
            self.__longitude = longitude
        else:
            raise ValueError

        self.owner_id = owner_id
        self.owner = owner
        self.rooms = rooms
        self.capacity = capacity
        self.surface = surface
        self.reviews = []
        self.amenities = []

    @property
    def title(self):
        return self.__title

    @title.setter
    def title(self, title):
        if title is not None and 0 < len(title) <= 100:
            self.__title = title
        else:
            raise ValueError

    @property
    def price(self):
        return self.__price

    @price.setter
    def price(self, price):
        if price is not None and price >= 0:
            self.__price = price
        else:
            raise ValueError

    @property
    def latitude(self):
        return self.__latitude

    @latitude.setter
    def latitude(self, latitude):
        if latitude is not None and -90.0 <= latitude <= 90.0:
            self.__latitude = latitude
        else:
            raise ValueError

    @property
    def longitude(self):
        return self.__longitude

    @longitude.setter
    def longitude(self, longitude):
        if longitude is not None and -180.0 <= longitude <= 180.0:
            self.__longitude = longitude
        else:
            raise ValueError
    """
