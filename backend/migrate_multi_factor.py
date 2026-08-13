from app import create_app
from extensions import db
import sqlalchemy as sa

def migrate():
    app = create_app()
    with app.app_context():
        engine = db.engine
        inspector = sa.inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('emission_record')]
        
        with engine.begin() as conn:
            if 'driving_condition' not in columns:
                conn.execute(sa.text("ALTER TABLE emission_record ADD COLUMN driving_condition VARCHAR(20) DEFAULT 'mixed'"))
                print("Added driving_condition column")
            if 'actual_mileage' not in columns:
                conn.execute(sa.text("ALTER TABLE emission_record ADD COLUMN actual_mileage FLOAT DEFAULT 0.0"))
                print("Added actual_mileage column")
            if 'ref_mileage' not in columns:
                conn.execute(sa.text("ALTER TABLE emission_record ADD COLUMN ref_mileage FLOAT DEFAULT 0.0"))
                print("Added ref_mileage column")
                
        print("Migration complete!")

if __name__ == '__main__':
    migrate()
