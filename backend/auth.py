from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

# Blueprint is like a mini-app — groups related routes together
auth_bp = Blueprint('auth', __name__)


# REGISTER — POST /api/auth/register
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()  # get data sent from frontend

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    # Hash the password — never store plain text passwords
    hashed_password = generate_password_hash(data['password'])

    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201


@auth_bp.route('/debug-users')
def debug_users():
    users = User.query.all()

    return jsonify([
        {
            "id": u.id,
            "email": u.email,
            "name": u.name
        }
        for u in users
    ])

# LOGIN — POST /api/auth/login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists AND password matches
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Create a JWT token — this is what React will store and send with every request
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        }
    }), 200