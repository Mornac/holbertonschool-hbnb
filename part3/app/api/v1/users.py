from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('users', description='User operations')


user_model = api.model('User', {
    'first_name': fields.String(required=True, description='The first name of the user'),
    'last_name': fields.String(required=True, description='The last name of the user'),
    'email': fields.String(required=True, description='The email address of the user'),
    'password': fields.String(required=True, description='The password of the user')
})


@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created.')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    @jwt_required(optional=True)
    def post(self):
        """
        Register a new user
        """
        user_data = api.payload
        
        print(user_data.items())
        
        if ("is_admin", 1) in user_data.items():
            current_user = get_jwt_identity()
            if not current_user or not current_user["is_admin"]:
                return {'error': 'Admin privileges required'}, 403

        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400

        try:
            new_user = facade.create_user(user_data)
        except ValueError:
            return {'error': 'Invalid input data'}, 400
        else:
            new_user.hash_password(user_data["password"])
            return {
                'id': new_user.id,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name,
                'email': new_user.email
            }, 201

    @api.response(200, 'User list retrieved successfully')
    @api.response(404, 'No user found')
    def get(self):
        """
        Get user list
        """
        user_list = facade.get_user_list()
        users = []
        if len(user_list) == 0:
            return {'error': 'No user found'}, 404
        for user in user_list:
            users.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            })
        return users, 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """
        Get user details by ID
        """
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200

    @api.response(200, 'User details updated successfully')
    @api.response(404, 'User not found')
    @api.response(400, 'Invalid input data')
    @api.expect(user_model, validate=True)
    @jwt_required()
    def put(self, user_id):
        """
        Update an existing user
        """
        user_data = api.payload
        current_user = get_jwt_identity()

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        if user_id != current_user["id"] and not current_user["is_admin"]:
            return {'error': 'Unauthorized action'}, 403

        if (user_data["email"] != user.email or not user.verify_password(user_data["password"])) and not current_user["is_admin"]:
            return {'error': 'You cannot modify your email or password'}, 400

        updated_user = facade.update_user(user_id, user_data)
        if not updated_user:
            return {'error': 'Invalid input data'}, 400
        return {'message': 'User details updated successfully'}, 200
