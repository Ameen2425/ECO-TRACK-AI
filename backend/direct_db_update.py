import sqlite3
import os

db_path = os.path.join('instance', 'ecotrack.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    # Try current directory too just in case
    db_path = 'ecotrack.db'
    if not os.path.exists(db_path):
        print("Database not found in current directory either.")
        exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

columns_to_add = [
    ("profile_image", "VARCHAR(255)"),
    ("updated_at", "DATETIME")
]

for col_name, col_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE user ADD COLUMN {col_name} {col_type}")
        print(f"Added column {col_name}")
    except sqlite3.OperationalError as e:
        print(f"Column {col_name} might already exist: {e}")

conn.commit()
conn.close()
print("Direct database update complete.")
