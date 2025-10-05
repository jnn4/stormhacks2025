from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
from models import db, User, Post, TypingSession
from auth import auth_bp
from auth_utils import get_command_explanation
from activity import activity_bp
from terminal import terminal_bp
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Load Gemini API configuration
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Initialize Gemini client if API key is available
    client = None
    if api_key:
        client = genai.Client(api_key=api_key)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(terminal_bp)
    # Create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
    
    # Register routes
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to StormHacks 2025 API',
            'status': 'running'
        })
    
    @app.route('/api/users', methods=['GET'])
    def get_users():
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
    
    @app.route('/api/posts', methods=['GET'])
    def get_posts():
        posts = Post.query.all()
        return jsonify([post.to_dict() for post in posts])
    
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200
    
    @app.route('/chat', methods=['GET', 'POST'])
    def chat():
        if request.method == 'GET':
            return jsonify({'message': 'Chat endpoint is ready'})
        
        try:
            data = request.get_json()
            user_message = data.get('message', '')
            
            if not user_message:
                return jsonify({"error": "No message provided"}), 400
            
            if not client:
                return jsonify({"error": "Gemini API not configured"}), 500
            
            # Use Gemini to generate response
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=user_message,
            )
            
            return jsonify({"reply": response.text})
        except Exception as e:
            print(f"Error in chat endpoint: {e}")
            return jsonify({"error": str(e)}), 500
    
    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(host='127.0.0.1', port=5000, debug=True)
