import mysql.connector
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def setup_database():
    """
    Setup the database, create tables, and add admin user
    """
    try:
        # Connect without specifying database first
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="123456"
        )
        cursor = conn.cursor()
        
        # Create database
        print("Creating database 'fleetflow'...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS fleetflow")
        cursor.execute("USE fleetflow")
        print("Database 'fleetflow' ready!")
        
        # Create users table
        print("\nCreating 'users' table...")
        create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('manager', 'dispatcher', 'safety', 'analyst') DEFAULT 'manager',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        print("Table 'users' created successfully!")
        
        # Check if admin user exists
        cursor.execute("SELECT * FROM users WHERE email = 'admin@fleetflow.com'")
        existing_user = cursor.fetchone()
        
        if existing_user:
            print("\nAdmin user already exists!")
        else:
            # Create admin user
            print("\nCreating admin user...")
            admin_email = "admin@fleetflow.com"
            admin_password = "admin123"
            password_hash = bcrypt.generate_password_hash(admin_password).decode('utf-8')
            
            insert_query = """
            INSERT INTO users (email, password_hash, role)
            VALUES (%s, %s, %s)
            """
            cursor.execute(insert_query, (admin_email, password_hash, 'manager'))
            conn.commit()
            print("Admin user created successfully!")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("DATABASE SETUP COMPLETE!")
        print("="*60)
        print("\nAdmin Login Credentials:")
        print(f"  Email:    admin@fleetflow.com")
        print(f"  Password: admin123")
        print("="*60)
        print("\nYou can now start the backend server with: python run.py")
        
        return True
        
    except mysql.connector.Error as err:
        print(f"\nDatabase Error: {err}")
        print("\nPlease ensure:")
        print("  1. MySQL is running")
        print("  2. The password in app/db.py is correct")
        print("  3. You have necessary permissions")
        return False
    except Exception as e:
        print(f"\nError: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("FLEETFLOW DATABASE SETUP")
    print("="*60)
    setup_database()
