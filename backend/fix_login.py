import sqlite3
import os

def migrate_users():
    # Identify all possible paths
    paths = [
        ('instance/ecotrack.db', 'instance/ecotrack_v4.db'),
        ('backend/instance/ecotrack.db', 'backend/instance/ecotrack_v4.db'),
        ('backend/instance/ecotrack.db', 'instance/ecotrack_v4.db'),
        ('instance/ecotrack.db', 'backend/instance/ecotrack_v4.db')
    ]

    migrated = 0
    for old_path, new_path in paths:
        if os.path.exists(old_path) and os.path.exists(new_path):
            print(f"Migrating from {old_path} to {new_path}...")
            try:
                conn_new = sqlite3.connect(new_path)
                conn_new.execute(f"ATTACH DATABASE '{old_path}' AS old_db")
                # Copy all users that don't already exist
                conn_new.execute("INSERT OR IGNORE INTO user SELECT * FROM old_db.user")
                conn_new.commit()
                conn_new.close()
                print("  ✅ Success!")
                migrated += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")

    if migrated == 0:
        print("❌ Could not find an old database and new database pair to migrate users.")
    else:
        print(f"\n✨ User migration attempt complete. {migrated} pairs processed.")

if __name__ == '__main__':
    migrate_users()
