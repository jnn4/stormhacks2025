"""
Script to create all database tables
Usage: python create_tables.py
"""
from app import create_app
from models import db


def create_tables():
    """Create all tables in the database"""
    app = create_app()
    
    with app.app_context():
        print("Creating all tables...")
        db.create_all()
        print("✓ All tables created successfully!")
        
        # Print table information
        print("\nCreated tables:")
        inspector = db.inspect(db.engine)
        for table_name in inspector.get_table_names():
            print(f"  - {table_name}")
            columns = inspector.get_columns(table_name)
            for column in columns:
                print(f"    • {column['name']} ({column['type']})")


if __name__ == '__main__':
    create_tables()

