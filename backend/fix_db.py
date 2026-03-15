from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE user ADD COLUMN username VARCHAR(80)"))
        db.session.commit()
        print("Successfully added 'username' column to User table.")
    except Exception as e:
        print(f"Error adding column: {e}")
