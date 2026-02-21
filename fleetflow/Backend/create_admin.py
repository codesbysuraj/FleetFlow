from flask_bcrypt import Bcrypt
from app.db import get_connection

bcrypt = Bcrypt()

def create_admin_user(email, password, role="manager"):
    """
    Create an admin user in the database
    """
    # Hash the password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"User with email {email} already exists!")
            cursor.close()
            conn.close()
            return False
        
        # Insert the new admin user
        query = """
        INSERT INTO users (email, password_hash, role)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (email, password_hash, role))
        conn.commit()
        
        print(f"Admin user created successfully!")
        print(f"Email: {email}")
        print(f"Role: {role}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False

if __name__ == "__main__":
    # Default admin credentials
    admin_email = "admin@fleetflow.com"
    admin_password = "admin123"
    
    print("Creating admin user...")
    create_admin_user(admin_email, admin_password, role="manager")
    
    print("\n" + "="*50)
    print("Use these credentials to login:")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("="*50)
