"""
Script to drop all database tables
Usage: python drop_tables.py

WARNING: This will delete all data in the database!
"""
from app import create_app
from models import db


def list_tables():
    """Drop all tables from the database"""
    app = create_app()
    
    with app.app_context():
        # Get table names before dropping
        inspector = db.inspect(db.engine)
        table_names = inspector.get_table_names()
        
        if not table_names:
            print("No tables found in the database.")
            return
        
        for table_name in table_names:
            print(f"{table_name}")
        #print all columns for each table
        for table_name in table_names:
            print(f"\nColumns for {table_name}:")
            inspector = db.inspect(db.engine)
            columns = inspector.get_columns(table_name)
            for column in columns:
                print(f"  - {column['name']} ({column['type']})")


if __name__ == '__main__':
    list_tables()

