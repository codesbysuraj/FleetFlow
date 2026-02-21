import mysql.connector
def get_connection () :
    conn = mysql.connector.connect(
        host="localhost",
        user="root",                 
        password="abc123",
        database="fleetflow"
    )
    return conn

    


