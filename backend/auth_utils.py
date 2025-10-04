"""
JWT authentication utilities
"""
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app


def generate_jwt_token(user_data):
    """
    Generate a JWT token for a user
    
    Args:
        user_data (dict): User information to encode in the token
        
    Returns:
        str: JWT token
    """
    payload = {
        'user': user_data,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS'])
    }
    
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm=current_app.config['JWT_ALGORITHM']
    )
    
    return token


def decode_jwt_token(token):
    """
    Decode and verify a JWT token
    
    Args:
        token (str): JWT token to decode
        
    Returns:
        dict: Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=[current_app.config['JWT_ALGORITHM']]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token


def get_token_from_header():
    """
    Extract JWT token from Authorization header
    
    Returns:
        str: Token or None if not found
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    # Expected format: "Bearer <token>"
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]


def token_required(f):
    """
    Decorator to require valid JWT token for a route
    
    Usage:
        @app.route('/protected')
        @token_required
        def protected_route(current_user):
            return jsonify({'user': current_user})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({
                'error': 'Authentication required',
                'message': 'No token provided'
            }), 401
        
        payload = decode_jwt_token(token)
        
        if not payload:
            return jsonify({
                'error': 'Invalid or expired token',
                'message': 'Please login again'
            }), 401
        
        # Pass the user data to the route
        return f(current_user=payload.get('user'), *args, **kwargs)
    
    return decorated


def token_optional(f):
    """
    Decorator that allows optional JWT token for a route
    If token is provided and valid, user data is passed, otherwise None
    
    Usage:
        @app.route('/optional')
        @token_optional
        def optional_route(current_user):
            if current_user:
                return jsonify({'user': current_user})
            return jsonify({'message': 'Anonymous user'})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        current_user = None
        
        if token:
            payload = decode_jwt_token(token)
            if payload:
                current_user = payload.get('user')
        
        return f(current_user=current_user, *args, **kwargs)
    
    return decorated

