import asyncio
import os
import aiomysql
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST", "zephyr.proxy.rlwy.net")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 17528))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "BomZXjbYbKAHcTkdWJStkbYewulNIUJL")
MYSQL_DB = os.getenv("MYSQL_DB", "railway")

async def main():
    print(f"Connecting to database {MYSQL_DB} on {MYSQL_HOST}:{MYSQL_PORT}...")
    conn = await aiomysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        db=MYSQL_DB,
        autocommit=True
    )
    async with conn.cursor() as cur:
        # Disable foreign key checks to drop cleanly
        await cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        tables = ["saved_properties", "interests", "properties", "contacts", "blogs", "users"]
        for table in tables:
            print(f"Dropping table {table} if exists...")
            await cur.execute(f"DROP TABLE IF EXISTS {table};")
            
        await cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
        print("All tables dropped successfully!")
        
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
