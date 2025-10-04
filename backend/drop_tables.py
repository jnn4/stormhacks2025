"""
Script to drop all database tables
Usage: python drop_tables.py

WARNING: This will delete all data in the database!
"""
from app import create_app
from models import db


def drop_tables():
    """Drop all tables from the database"""
    app = create_app()
    
    with app.app_context():
        # Get table names before dropping
        inspector = db.inspect(db.engine)
        table_names = inspector.get_table_names()
        
        if not table_names:
            print("No tables found in the database.")
            return
        
        print("WARNING: This will delete all data in the following tables:")
        for table_name in table_names:
            print(f"  - {table_name}")
        
        response = input("\nAre you sure you want to continue? (yes/no): ")
        
        if response.lower() == 'yes':
            print("\nDropping all tables...")
            db.drop_all()
            print("✓ All tables dropped successfully!")
        else:
            print("Operation cancelled.")


if __name__ == '__main__':
    drop_tables()

