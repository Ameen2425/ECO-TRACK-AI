from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Check if columns exist and add them if not
        db.session.execute(text("ALTER TABLE user ADD COLUMN profile_image VARCHAR(255)"))
        print("Added profile_image")
    except Exception as e:
        print(f"profile_image might already exist: {e}")

    try:
        db.session.execute(text("ALTER TABLE user ADD COLUMN updated_at DATETIME"))
        print("Added updated_at")
    except Exception as e:
        print(f"updated_at might already exist: {e}")

    db.session.commit()
    print("Database update attempt complete.")
