"""
Example of how to create protected routes with JWT authentication
This file is for reference - add these routes to app.py as needed
"""

from flask import jsonify
from auth_utils import token_required, token_optional


# Example 1: Protected route (requires authentication)
@app.route('/api/profile')
@token_required
def get_profile(current_user):
    """
    Protected route - requires valid JWT token
    The current_user parameter contains the decoded JWT payload
    """
    return jsonify({
        'profile': {
            'id': current_user['id'],
            'login': current_user['login'],
            'name': current_user['name'],
            'email': current_user['email'],
            'avatar_url': current_user['avatar_url']
        }
    }), 200


# Example 2: Optional authentication
@app.route('/api/posts')
@token_optional
def get_posts_with_optional_auth(current_user):
    """
    Route with optional authentication
    If user is authenticated, show more information
    """
    posts = Post.query.all()
    
    if current_user:
        # User is authenticated - show all post details
        return jsonify({
            'authenticated': True,
            'user': current_user['login'],
            'posts': [post.to_dict() for post in posts]
        })
    else:
        # Anonymous user - show limited information
        return jsonify({
            'authenticated': False,
            'posts': [{'id': p.id, 'title': p.title} for p in posts]
        })


# Example 3: Admin-only route
@app.route('/api/admin/users')
@token_required
def admin_get_users(current_user):
    """
    Protected admin route
    You can add additional role checks here
    """
    # Example: Check if user is admin (you'd need to store roles in JWT)
    if current_user.get('role') != 'admin':
        return jsonify({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }), 403
    
    users = User.query.all()
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200


# Example 4: Create a resource (authenticated)
@app.route('/api/posts', methods=['POST'])
@token_required
def create_post(current_user):
    """
    Create a new post - requires authentication
    """
    from flask import request
    
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({
            'error': 'Invalid data',
            'message': 'Title and content are required'
        }), 400
    
    # Create post associated with authenticated user
    post = Post(
        title=data['title'],
        content=data['content'],
        user_id=current_user['id']  # Use ID from JWT
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Post created successfully',
        'post': post.to_dict()
    }), 201


# Example 5: Manual token verification (if decorator doesn't work)
@app.route('/api/custom')
def custom_route():
    """
    Manual token verification without decorator
    Useful for special cases
    """
    from auth_utils import get_token_from_header, decode_jwt_token
    
    token = get_token_from_header()
    
    if not token:
        return jsonify({
            'error': 'Authentication required',
            'message': 'No token provided'
        }), 401
    
    payload = decode_jwt_token(token)
    
    if not payload:
        return jsonify({
            'error': 'Invalid token',
            'message': 'Token is invalid or expired'
        }), 401
    
    current_user = payload.get('user')
    
    return jsonify({
        'message': f'Hello {current_user["login"]}!',
        'data': 'Your custom data here'
    }), 200

