import mysql.connector
import getpass

print("MySQL Connection Test")
print("=" * 50)

# Test with different passwords
passwords_to_try = [
    "Notyourtype@1",  # Current password in db.py
    "",               # Empty password
    "root",           # Common default
]

print("\nTesting common passwords...")
for pwd in passwords_to_try:
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password=pwd
        )
        print(f"✓ SUCCESS with password: '{pwd if pwd else '(empty)'}'")
        conn.close()
        print("\nUpdate app/db.py with this password!")
        break
    except mysql.connector.Error as err:
        print(f"✗ Failed with password: '{pwd if pwd else '(empty)'}'")

print("\n" + "=" * 50)
print("\nIf none worked, enter your MySQL root password manually:")
try:
    manual_pwd = getpass.getpass("MySQL root password: ")
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password=manual_pwd
    )
    print(f"✓ SUCCESS! Update app/db.py with this password.")
    conn.close()
except Exception as e:
    print(f"✗ Connection failed: {e}")
