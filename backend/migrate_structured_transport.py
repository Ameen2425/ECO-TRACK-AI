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
            if 'vehicle_brand' not in columns:
                conn.execute(sa.text('ALTER TABLE emission_record ADD COLUMN vehicle_brand VARCHAR(100)'))
                print("Added vehicle_brand column")
            if 'vehicle_year' not in columns:
                conn.execute(sa.text('ALTER TABLE emission_record ADD COLUMN vehicle_year INTEGER'))
                print("Added vehicle_year column")
            if 'base_factor' not in columns:
                conn.execute(sa.text('ALTER TABLE emission_record ADD COLUMN base_factor FLOAT DEFAULT 0.0'))
                print("Added base_factor column")
                
        print("Migration complete!")

if __name__ == '__main__':
    migrate()
