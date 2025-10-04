"""
Script to populate database with sample data
Usage: python populate_data.py
"""
from app import create_app
from models import db, User, Post
from datetime import datetime, timedelta


def populate_data():
    """Populate database with sample data"""
    app = create_app()
    
    with app.app_context():
        print("Populating database with sample data...")
        
        # Check if data already exists
        if User.query.first():
            print("⚠ Database already contains data.")
            response = input("Do you want to clear existing data and repopulate? (yes/no): ")
            if response.lower() != 'yes':
                print("Operation cancelled.")
                return
            
            print("Clearing existing data...")
            db.session.query(Post).delete()
            db.session.query(User).delete()
            db.session.commit()
        
        # Create sample users
        users = [
            User(
                username='alice',
                email='alice@example.com',
                created_at=datetime.utcnow() - timedelta(days=30)
            ),
            User(
                username='bob',
                email='bob@example.com',
                created_at=datetime.utcnow() - timedelta(days=20)
            ),
            User(
                username='charlie',
                email='charlie@example.com',
                created_at=datetime.utcnow() - timedelta(days=10)
            )
        ]
        
        db.session.add_all(users)
        db.session.commit()
        print(f"✓ Created {len(users)} users")
        
        # Create sample posts
        posts = [
            Post(
                title='Welcome to StormHacks 2025!',
                content='This is our first post. We are excited to build something amazing!',
                user_id=users[0].id,
                created_at=datetime.utcnow() - timedelta(days=29)
            ),
            Post(
                title='Building with Flask and PostgreSQL',
                content='Flask is a great framework for building web applications. PostgreSQL is a powerful database.',
                user_id=users[0].id,
                created_at=datetime.utcnow() - timedelta(days=25)
            ),
            Post(
                title='Docker makes deployment easy',
                content='Using Docker Compose to manage our PostgreSQL instance is very convenient.',
                user_id=users[1].id,
                created_at=datetime.utcnow() - timedelta(days=15)
            ),
            Post(
                title='Team collaboration tips',
                content='Make sure to communicate regularly with your team and commit often!',
                user_id=users[1].id,
                created_at=datetime.utcnow() - timedelta(days=10)
            ),
            Post(
                title='Final preparations',
                content='We are getting ready for the demo. Excited to present our project!',
                user_id=users[2].id,
                created_at=datetime.utcnow() - timedelta(days=2)
            )
        ]
        
        db.session.add_all(posts)
        db.session.commit()
        print(f"✓ Created {len(posts)} posts")
        
        print("\n✓ Database populated successfully!")
        print("\nSummary:")
        print(f"  - Users: {User.query.count()}")
        print(f"  - Posts: {Post.query.count()}")
        
        # Display sample data
        print("\nSample users:")
        for user in User.query.all():
            print(f"  - {user.username} ({user.email})")
        
        print("\nSample posts:")
        for post in Post.query.all():
            print(f"  - '{post.title}' by {post.author.username}")


if __name__ == '__main__':
    populate_data()

