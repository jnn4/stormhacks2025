from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
from models import db, User, Post
import os
from dotenv import load_dotenv
from auth import auth_bp

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

def create_app(config_name='default'):
    """Application factory"""
    app = Flask(__name__)

    # Load .env variables
    load_dotenv()

    # Secret key
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Database URI from .env
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
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

    app.register_blueprint(auth_bp)
    

    @app.route('/chat', methods=['GET', 'POST'])
    def chat():
        if(request.method == 'GET'):

            data = "hello world"
        return jsonify({'data': data})




    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)

