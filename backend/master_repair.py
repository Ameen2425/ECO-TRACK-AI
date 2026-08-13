import sqlite3
import os

def repair_db(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping: {db_path} (Not found)")
        return

    print(f"Repairing: {db_path}...")
    conn = sqlite3.connect(db_path, timeout=10)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(emission_record)")
    existing = [row[1] for row in cursor.fetchall()]

    required = [
        ('vehicle_brand', 'VARCHAR(100)', "''"),
        ('vehicle_model', 'VARCHAR(100)', "''"),
        ('vehicle_year', 'INTEGER', "0"),
        ('fuel_detail', 'VARCHAR(50)', "''"),
        ('vehicle_age_years', 'INTEGER', "0"),
        ('age_multiplier', 'FLOAT', "1.0"),
        ('base_factor', 'FLOAT', "0.0"),
        ('driving_condition', 'VARCHAR(20)', "'mixed'"),
        ('actual_mileage', 'FLOAT', "0.0"),
        ('ref_mileage', 'FLOAT', "0.0"),
        ('ac_hours', 'FLOAT', "0.0"),
        ('house_size', 'VARCHAR(20)', "''"),
        ('geyser_usage', 'BOOLEAN', "0"),
        ('has_refrigerator', 'BOOLEAN', "1"),
        ('cooking_fuel', 'VARCHAR(50)', "''"),
        ('cooking_frequency', 'VARCHAR(50)', "''"),
        ('waste_type', 'VARCHAR(50)', "''"),
        ('recycling_habit', 'VARCHAR(20)', "''"),
        ('composting', 'BOOLEAN', "0"),
        ('meal_frequency', 'VARCHAR(50)', "''"),
        ('dairy_level', 'VARCHAR(20)', "''"),
        ('family_size', 'VARCHAR(20)', "'3-4'"),
        ('entry_mode', 'VARCHAR(20)', "'detailed'")
    ]

    added = 0
    for col, col_type, d_val in required:
        if col not in existing:
            try:
                cursor.execute(f"ALTER TABLE emission_record ADD COLUMN {col} {col_type} DEFAULT {d_val}")
                print(f"  + Added {col}")
                added += 1
            except Exception as e:
                print(f"  - Failed {col}: {e}")

    conn.commit()
    conn.close()
    print(f"Finished {db_path}. Added {added} columns.\n")

if __name__ == '__main__':
    # Target all possible DB paths identified
    repair_db('instance/ecotrack.db')
    repair_db('backend/instance/ecotrack.db')
    repair_db('backend/ecotrack.db')
    repair_db('ecotrack.db')
