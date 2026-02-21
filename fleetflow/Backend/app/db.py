import mysql.connector
def get_connection () :
    conn = mysql.connector.connect(
        host="localhost",
        user="root",                 
        password="Notyourtype@1",
        database="fleetflow"
    )
    return conn

    


