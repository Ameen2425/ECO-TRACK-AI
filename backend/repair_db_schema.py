import sqlite3
import os

def repair():
    db_path = os.path.join('instance', 'ecotrack.db')
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get current columns in emission_record
    cursor.execute("PRAGMA table_info(emission_record)")
    existing_columns = [row[1] for row in cursor.fetchall()]

    # Define all mandatory columns from models.py
    # Format: (column_name, sql_type, default_val)
    required_columns = [
        ('vehicle_model', 'VARCHAR(100)', "''"),
        ('fuel_detail', 'VARCHAR(50)', "''"),
        ('vehicle_age_years', 'INTEGER', "0"),
        ('age_multiplier', 'FLOAT', "1.0"),
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
        ('entry_mode', 'VARCHAR(20)', "'detailed'"),
        # --- Multi-Factor Transport Upgrades (New) ---
        ('vehicle_brand', 'VARCHAR(100)', "''"),
        ('vehicle_year', 'INTEGER', "0"),
        ('base_factor', 'FLOAT', "0.0"),
        ('driving_condition', 'VARCHAR(20)', "'mixed'"),
        ('actual_mileage', 'FLOAT', "0.0"),
        ('ref_mileage', 'FLOAT', "0.0")
    ]

    added_count = 0
    for col_name, col_type, default_val in required_columns:
        if col_name not in existing_columns:
            try:
                alter_query = f"ALTER TABLE emission_record ADD COLUMN {col_name} {col_type} DEFAULT {default_val}"
                cursor.execute(alter_query)
                print(f"✅ Added column: {col_name} ({col_type})")
                added_count += 1
            except Exception as e:
                print(f"❌ Failed to add {col_name}: {str(e)}")

    conn.commit()
    conn.close()
    
    if added_count > 0:
        print(f"\n✨ Repair complete! Added {added_count} missing columns.")
    else:
        print("\n✅ Schema is already up to date. No changes needed.")

if __name__ == '__main__':
    repair()
