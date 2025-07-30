from app import create_app, db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity

def create_test_data():
    app = create_app()
    with app.app_context():
        print("Creation of Test data...")
        
        # Check if the User alraeady exists
        existing_user = User.query.filter_by(email="test@example.com").first()
        if existing_user:
            print("User test@example.com already exists, use of existing User")
            user = existing_user
        else:
            # Create a TestUser
            user = User(
                first_name="Test",
                last_name="User",
                email="test@example.com",
                password="password123"
            )
            db.session.add(user)
            db.session.commit()
            print("TestUser created!")
        
        # Check if the Amenity already exists
        existing_amenity = Amenity.query.filter_by(name="WiFi").first()
        if existing_amenity:
            print("Amenity WiFi already exists")
            amenity = existing_amenity
        else:
            # Create a TestAmenity
            amenity = Amenity(
                name="WiFi"
            )
            db.session.add(amenity)
            db.session.commit()
            print("Amenity WiFi created!")
        
        # Check if Places already exist for this User
        existing_place = Place.query.filter_by(owner_id=user.id, title="Beaufiful Beach House").first()
        if existing_place:
            print("Place 'Beautiful Beach House' already exists")
        else:
            # Create a TestPlace
            place = Place(
                title="Beautiful Beach House",
                description="The first testPlace",
                price=150.0,
                latitude=43.6047,
                longitude=1.4442,
                rooms=3,
                capacity=6,
                surface=80,
                owner_id=user.id
            )
            db.session.add(place)
            db.session.commit()
            print("Place 'Beautiful Beach House' created!")
        
        # Create additional places
        additional_places = [
            {
                "title": "Cozy Cabin",
                "description": "Cozy Cabin",
                "price": 100.0,
                "latitude": 43.6100,
                "longitude": 1.4500,
                "rooms": 2,
                "capacity": 4,
                "surface": 50
            },
            {
                "title": "Modern Apartment",
                "description": "Modeern Apartment",
                "price": 200.0,
                "latitude": 43.5900,
                "longitude": 1.4300,
                "rooms": 5,
                "capacity": 10,
                "surface": 150
            }
        ]
        
        for place_data in additional_places:
            existing = Place.query.filter_by(owner_id=user.id, title=place_data["title"]).first()
            if not existing:
                place = Place(
                    title=place_data["title"],
                    description=place_data["description"],
                    price=place_data["price"],
                    latitude=place_data["latitude"],
                    longitude=place_data["longitude"],
                    rooms=place_data["rooms"],
                    capacity=place_data["capacity"],
                    surface=place_data["surface"],
                    owner_id=user.id
                )
                db.session.add(place)
                print(f"Place '{place_data['title']}' created!")
        
        db.session.commit()
        
        # Display a summary
        total_users = User.query.count()
        total_places = Place.query.count()
        total_amenities = Amenity.query.count()
        
        print(f"\n=== SUMMARY ===")
        print(f"Users: {total_users}")
        print(f"Places: {total_places}")
        print(f"Amenities: {total_amenities}")
        print("Test data created successfully!")

if __name__ == '__main__':
    create_test_data()
