from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
from models import db, User, Post, TypingSession
from auth import auth_bp
from activity import activity_bp
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration from config.py (single source of truth)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
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

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(activity_bp)
    

    @app.route('/chat', methods=['POST'])
    def chat():
        data = request.get_json()  # Get JSON body from POST
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400

        user_message = data["message"]
        

        try:
            # Call Gemini API
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_message
            )

            # Get the text reply
            reply_text = response.text

            # Optional: log to console
            print(f"User: {user_message}")
            print(f"Gemini: {reply_text}")

            return jsonify({"reply": reply_text})

        except Exception as e:
            print("Error calling Gemini API:", e)
            return jsonify({"error": "Failed to generate response"}), 500




    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

