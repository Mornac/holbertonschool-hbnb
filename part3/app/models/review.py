from app.models.model import db, BaseModel
from sqlalchemy.orm import relationship, validates
from app import db


class Review(BaseModel):
    __tablename__ = 'reviews'

    title = db.Column(db.Text, nullable=False)
    text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey('places.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    place = db.relationship("Place", back_populates="reviews")
    user = db.relationship("User", back_populates="reviews")

    def __repr__(self):
        return (f"<Review {self.id}")

    @validates("text")
    def validate_text(self, key, text):
        if text is not None and len(text) > 0:
            return text
        else:
            raise ValueError("Text can't be empty")

    @validates("rating")
    def validate_rating(self, key, rating):
        if 1 <= rating <= 5:
            return rating
        else:   
            raise ValueError("Rating must be an integer between 1 and 5")

    """
    def __init__(self, title, text, rating, place_id, place, user_id, user):
        super().__init__()
        self.title = title
        if text is not None and len(text) > 0:
            self.__text = text
        else:
            raise ValueError("Text can't be empty")
        if 1 <= rating <= 5:
            self.__rating = rating
        else:
            raise ValueError("Rating must be an integer between 1 and 5")
        self.place_id = place_id
        self.place = place
        self.user_id = user_id
        self.user = user
    """
