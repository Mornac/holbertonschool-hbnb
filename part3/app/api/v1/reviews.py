from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('reviews', description='Reviews operations')


review_model = api.model('Review', {
    'title': fields.String(required=True, description='Title of the review'),
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """
        Register a new review
        """
        review_data = api.payload
        current_user = get_jwt_identity()

        existing_user = facade.get_user(current_user["id"])
        if not existing_user:
            return {'error': 'User not found'}, 404

        review_data["user_id"] = existing_user.id

        existing_place = facade.get_place(review_data["place_id"])
        if not existing_place:
            return {'error': 'Place not found'}, 404

        if existing_place.owner_id == current_user["id"]:
            return {'error': 'You cannot review your own place'}, 400

        for review in existing_place.reviews:
            if review.user_id == current_user["id"]:
                return {'error': 'You have already reviewed this place'}, 400

        # review_data["place"] = existing_place

        try:
            new_review = facade.create_review(review_data)
        except ValueError:
            return {'error': 'Invalid input data'}, 400
        else:
            # existing_place.add_review(new_review)
            return {
                'id': new_review.id,
                'title': new_review.title,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user_id,
                'place_id': new_review.place_id
            }, 201

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """
        Retrieve a list of all reviews
        """
        review_list = facade.get_all_reviews()
        reviews = []
        if len(review_list) == 0:
            return {'error': 'No review found'}, 404
        for review in review_list:
            reviews.append({
                'id': review.id,
                'title': review.title,
                'text': review.text,
                'rating': review.rating,
            })
        return reviews, 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """
        Get review details by ID
        """
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return {
            'id': review.id,
            'title': review.title,
            'text': review.text,
            'rating': review.rating,
            'user_id': review.user_id,
            'place_id': review.place_id
        }, 200

    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, review_id):
        """
        Update a review's information
        """
        review_data = api.payload
        current_user = get_jwt_identity()

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if review.user_id != current_user["id"] and not current_user["is_admin"]:
            return {'error': 'Unauthorized action'}, 403

        updated_review = facade.update_review(review_id, review_data)
        if not updated_review:
            return {'error': 'Invalid input data'}, 400
        return {'message': 'Review updated successfully'}, 200

    @api.response(204, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        """
        Delete a review
        """
        current_user = get_jwt_identity()

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if review.user_id != current_user["id"] and not current_user["is_admin"]:
            return {'error': 'Unauthorized action'}, 403

        facade.delete_review(review_id)
        return {'message': 'Review deleted successfully'}, 204
