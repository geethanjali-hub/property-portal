import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

async def test_mongo():
    uri = 'mongodb://localhost:27017'
    print(f"Testing connection to {uri}...")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        # The is_primary command is a cheap way to test connection
        await client.admin.command('ping')
        print("OK: MongoDB connection successful!")
    except Exception as e:
        print(f"ERROR: MongoDB connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_mongo())
