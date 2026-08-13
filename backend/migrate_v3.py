"""
migrate_v3.py – Safe DB migration to add new columns to EmissionRecord and create UserSettings.
Run once from the backend/ directory:  python migrate_v3.py
"""
import sqlite3
import os

DB_PATH = os.path.join('instance', 'ecotrack.db')

NEW_EMISSION_COLUMNS = [
    ("vehicle_model",      "TEXT"),
    ("fuel_detail",        "TEXT"),
    ("vehicle_age_years",  "INTEGER DEFAULT 0"),
    ("age_multiplier",     "REAL DEFAULT 1.0"),
    ("ac_hours",           "REAL DEFAULT 0.0"),
    ("house_size",         "TEXT"),
    ("geyser_usage",       "INTEGER DEFAULT 0"),
    ("has_refrigerator",   "INTEGER DEFAULT 1"),
    ("cooking_fuel",       "TEXT"),
    ("cooking_frequency",  "TEXT"),
    ("waste_type",         "TEXT"),
    ("recycling_habit",    "TEXT"),
    ("composting",         "INTEGER DEFAULT 0"),
    ("meal_frequency",     "TEXT"),
    ("dairy_level",        "TEXT"),
    ("family_size",        "TEXT"),
    ("entry_mode",         "TEXT DEFAULT 'detailed'"),
]

CREATE_USER_SETTINGS = """
CREATE TABLE IF NOT EXISTS user_settings (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER NOT NULL UNIQUE REFERENCES user(id),
    daily_reminder     INTEGER DEFAULT 1,
    weekly_summary     INTEGER DEFAULT 1,
    goal_reminder      INTEGER DEFAULT 1,
    reminder_frequency TEXT    DEFAULT 'daily',
    animations_enabled INTEGER DEFAULT 1,
    updated_at         TEXT
);
"""

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database not found at {DB_PATH}")
        print("Run the Flask app once first so it creates the DB, then re-run this script.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # Get existing columns
    cur.execute("PRAGMA table_info(emission_record)")
    existing = {row[1] for row in cur.fetchall()}

    added = 0
    for col_name, col_def in NEW_EMISSION_COLUMNS:
        if col_name not in existing:
            sql = f"ALTER TABLE emission_record ADD COLUMN {col_name} {col_def}"
            cur.execute(sql)
            print(f"  + Added column: {col_name}")
            added += 1
        else:
            print(f"  ✓ Column already exists: {col_name}")

    # Create UserSettings table
    cur.execute(CREATE_USER_SETTINGS)
    print("  ✓ user_settings table ready")

    conn.commit()
    conn.close()
    print(f"\n[Done] Migration complete. {added} new columns added.")

if __name__ == '__main__':
    migrate()
