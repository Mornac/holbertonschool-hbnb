from app import create_app, db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity

def create_test_data():
    app = create_app()
    with app.app_context():
        # Create a user
        user = User(
            first_name="Test",
            last_name="User",
            email="test@example.com",
            password="password123"
        )
        db.session.add(user)
        db.session.commit()
        
        # Create an amenity
        amenity = Amenity(
            name="WiFi"
        )
        db.session.add(amenity)
        db.session.commit()
        
        # Create a place
        place = Place(
            title="Beautiful Beach House",
            description="Beautiful Beach House",
            price=150.0,
            latitude=43.6047,
            longitude=1.4442,
            owner_id=user.id
        )
        db.session.add(place)
        db.session.commit()
        
        print("Test data created successfully!")

if __name__ == '__main__':
    create_test_data()
