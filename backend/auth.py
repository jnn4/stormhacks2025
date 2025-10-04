from flask import jsonify, redirect, request, Blueprint, current_app
from auth_utils import generate_jwt_token, token_required, token_optional
import requests
import secrets

# Store OAuth states temporarily (in production, use Redis or similar)
oauth_states = {}

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/auth/github')
def auth_github():
    """Initiate GitHub OAuth flow"""
    # Check if GitHub OAuth is configured
    if not current_app.config['GITHUB_CLIENT_ID'] or not current_app.config['GITHUB_CLIENT_SECRET']:
        return jsonify({
            'error': 'GitHub OAuth not configured',
            'message': 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env'
        }), 500
    
    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(32)
    oauth_states[state] = True  # Store state temporarily
    
    # Build GitHub authorization URL
    github_auth_url = 'https://github.com/login/oauth/authorize'
    params = {
        'client_id': current_app.config['GITHUB_CLIENT_ID'],
        'redirect_uri': current_app.config['GITHUB_REDIRECT_URI'],
        'scope': 'user user:email',  # 'user' scope includes email access
        'state': state
    }
    
    # Create full authorization URL
    auth_url = f"{github_auth_url}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&scope={params['scope']}&state={params['state']}"
    
    return redirect(auth_url)

@auth_bp.route('/auth/github/callback')
def auth_github_callback():
    """Handle GitHub OAuth callback"""
    # Check for errors
    error = request.args.get('error')
    if error:
        return jsonify({
            'error': 'GitHub authorization failed',
            'message': request.args.get('error_description', 'Unknown error')
        }), 400
    
    # Verify state for CSRF protection
    state = request.args.get('state')
    if not state or state not in oauth_states:
        return jsonify({
            'error': 'Invalid state parameter',
            'message': 'Possible CSRF attack detected'
        }), 400
    
    # Remove used state
    del oauth_states[state]
    
    # Get authorization code
    code = request.args.get('code')
    if not code:
        return jsonify({
            'error': 'No authorization code',
            'message': 'Authorization code not received from GitHub'
        }), 400
    
    # Exchange code for access token
    token_url = 'https://github.com/login/oauth/access_token'
    token_data = {
        'client_id': current_app.config['GITHUB_CLIENT_ID'],
        'client_secret': current_app.config['GITHUB_CLIENT_SECRET'],
        'code': code,
        'redirect_uri': current_app.config['GITHUB_REDIRECT_URI']
    }
    token_headers = {
        'Accept': 'application/json'
    }
    
    try:
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_response.raise_for_status()
        token_json = token_response.json()
        
        if 'error' in token_json:
            return jsonify({
                'error': 'Token exchange failed',
                'message': token_json.get('error_description', token_json['error'])
            }), 400
        
        access_token = token_json.get('access_token')
        
        if not access_token:
            return jsonify({
                'error': 'No access token',
                'message': 'Failed to obtain access token from GitHub'
            }), 400
        
        # Get user information from GitHub
        user_url = 'https://api.github.com/user'
        user_headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        user_response = requests.get(user_url, headers=user_headers)
        user_response.raise_for_status()
        github_user = user_response.json()
        
        # Get user email if not public
        if not github_user.get('email'):
            try:
                email_url = 'https://api.github.com/user/emails'
                email_response = requests.get(email_url, headers=user_headers)
                email_response.raise_for_status()
                emails = email_response.json()
                # Get primary email
                for email in emails:
                    if email.get('primary'):
                        github_user['email'] = email['email']
                        break
            except requests.exceptions.HTTPError as email_error:
                # If we can't get emails (403 or other error), continue without email
                # This can happen if user hasn't granted email permission
                print(f"Warning: Could not fetch user emails: {email_error}")
                github_user['email'] = None
        
        # Prepare user data for JWT
        user_data = {
            'id': github_user['id'],
            'login': github_user['login'],
            'name': github_user.get('name'),
            'email': github_user.get('email'),
            'avatar_url': github_user.get('avatar_url'),
            'github_access_token': access_token  # Store GitHub token in JWT if needed
        }
        
        # Generate JWT token
        jwt_token = generate_jwt_token(user_data)
        
        # Return JWT token and user information
        return jsonify({
            'success': True,
            'message': 'Successfully authenticated with GitHub',
            'token': jwt_token,
            'user': {
                'id': user_data['id'],
                'login': user_data['login'],
                'name': user_data['name'],
                'email': user_data['email'],
                'avatar_url': user_data['avatar_url']
            }
        }), 200
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Request failed',
            'message': str(e)
        }), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """
    Log out the current user
    Note: With JWT, logout is handled client-side by removing the token.
    This endpoint is informational only.
    """
    return jsonify({
        'success': True,
        'message': 'Successfully logged out. Please remove the token from client storage.'
    }), 200

@auth_bp.route('/auth/user')
@token_required
def get_current_user(current_user):
    """Get the currently authenticated user (requires valid JWT token)"""
    return jsonify({
        'authenticated': True,
        'user': {
            'id': current_user['id'],
            'login': current_user['login'],
            'name': current_user['name'],
            'email': current_user['email'],
            'avatar_url': current_user['avatar_url']
        }
    }), 200

