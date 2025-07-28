from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('places', description='Place operations')


amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'title': fields.String(description='Title of the review'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
    })

place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'owner_id': fields.String(required=True, description='ID of the owner'),
    'owner': fields.Nested(user_model, description='Owner of the place'),
    'rooms': fields.Integer(required=True, description='Number of rooms of the place'),
    'capacity': fields.Integer(description='Maximum number of people allowed'),
    'surface': fields.Float(description='Surface of the place'),
    'amenities': fields.List(fields.Nested(amenity_model), required=True, description="List of amenities"),
    'reviews': fields.List(fields.Nested(review_model), description="List of reviews")
})


@api.route('/')
class PlaceList(Resource):
    @api.expect(place_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """
        Register a new place
        """
        place_data = api.payload
        current_user = get_jwt_identity()

        existing_user = facade.get_user(place_data["owner_id"])
        if not existing_user:
            return {'error': 'User not found'}, 404

        if place_data["owner_id"] != current_user["id"]:
            return {'error': 'Unauthorized action'}, 403

        # place_data["owner"] = existing_user

        amenities = []
        for amenity in place_data["amenities"]:
            amenities.append(facade.get_amenity(amenity["id"]))

        place_data["amenities"] = amenities

        try:
            new_place = facade.create_place(place_data)
        except ValueError:
            return {'error': 'Invalid input data'}, 400

        return {
            'id': new_place.id,
            'title': new_place.title,
            'description': new_place.description,
            'price': new_place.price,
            'latitude': new_place.latitude,
            'longitude': new_place.longitude,
            'owner_id': new_place.owner_id,
            'rooms': new_place.rooms,
            'capacity': new_place.capacity,
            'surface': new_place.surface,
        }, 201

    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """
        Retrieve a list of all places
        """
        place_list = facade.get_all_places()
        places = []
        if len(place_list) == 0:
            return {'error': 'No place found'}, 404
        for place in place_list:
            places.append({
                'id': place.id,
                'title': place.title,
                'description': place.description,
                'price': place.price,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'owner_id': place.owner_id,
                'rooms': place.rooms,
                'capacity': place.capacity,
                'surface': place.surface,
                'amenities' : [amenity.name for amenity in place.amenities]
            })
        return places, 200


@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """
        Get place details by ID
        """
        place = facade.get_place(place_id)
        owner = facade.get_user(place.owner_id)

        amenities = [{
            "id": amenity.id,
            "name": amenity.name
        } for amenity in place.amenities]

        reviews = [{
            "id":  review.id,
            "title": review.title,
            "text": review.text,
            "rating": review.rating,
            "user":{
                "id": facade.get_user(review.user_id).id,
                "first_name": facade.get_user(review.user_id).first_name,
                "last_name": facade.get_user(review.user_id).last_name,
            }
        } for review in place.reviews]

        if not place:
            return {'error': 'Place not found'}, 404
        return {
            'id': place.id,
            'title': place.title,
            'description': place.description,
            'price': place.price,
            'latitude': place.latitude,
            'longitude': place.longitude,
            'owner': {
                "id": owner.id,
                "first_name": owner.first_name,
                "last_name": owner.last_name,
                "email": owner.email
            },
            'rooms': place.rooms,
            'capacity': place.capacity,
            'surface': place.surface,
            'amenities': amenities,
            'reviews': reviews
        }, 200

    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, place_id):
        """
        Update a place's information
        """
        place_data = api.payload
        current_user = get_jwt_identity()

        place = facade.get_place(place_id)
        if place.owner_id != current_user["id"] and not current_user["is_admin"]:
            return {'error': 'Unauthorized action'}, 403

        if not place:
            return {'error': 'Place not found'}, 404

        updated_place = facade.update_place(place_id, place_data)
        if not updated_place:
            return {'error': 'Invalid input data'}, 400

        place.amenities = []
        # for amenity in place_data["amenities"]:
            # place.add_amenity(facade.get_amenity(amenity["id"]))

        return {'message': 'Place updated successfully'}, 200


@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """
        Retrieve all reviews for a specific place
        """
        existing_place = facade.get_place(place_id)
        if not existing_place:
            return {'error': 'Place not found'}, 404

        review_list = facade.get_reviews_by_place(place_id)

        reviews = []
        for review in review_list:
            user = facade.get_user(review.user_id)
            reviews.append({
                'id': review.id,
                'title': review.title,
                'text': review.text,
                'rating': review.rating,
                'user': {
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        return reviews, 200
