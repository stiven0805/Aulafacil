import time
import psycopg2

while True:
    try:
        conn = psycopg2.connect(
            dbname="aulafacil_db",
            user="postgres",
            password="postgres",
            host="db",
            port="5432"
        )
        print("✅ DB lista")
        break
    except psycopg2.OperationalError:
        print("⏳ Esperando DB...")
        time.sleep(2)