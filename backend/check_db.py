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
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT COUNT(*) as count FROM properties;")
        row = await cur.fetchone()
        print("Total properties in DB:", row['count'])
        
        await cur.execute("SELECT id, title, is_active, is_featured FROM properties LIMIT 5;")
        rows = await cur.fetchall()
        for r in rows:
            print(f"- ID: {r['id']}, Title: {r['title']}, Active: {r['is_active']}, Featured: {r['is_featured']}")
            
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
