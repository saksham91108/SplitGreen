import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    # Read from .env
    from dotenv import load_dotenv
    load_dotenv()
    
    mongo_url = os.getenv("MONGO_URL")
    mongo_db = os.getenv("MONGO_DB")
    
    print(f"🔍 Testing MongoDB connection...")
    print(f"📍 URL: {mongo_url}")
    print(f"📦 Database: {mongo_db}")
    print()
    
    try:
        # Connect
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        db = client[mongo_db]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"📚 Collections: {collections if collections else 'None (database is empty)'}")
        
        # Count users
        user_count = await db.users.count_documents({})
        print(f"👥 Users in database: {user_count}")
        
        # List all users
        if user_count > 0:
            print("\n📋 Users:")
            async for user in db.users.find():
                print(f"  - {user.get('name')} ({user.get('email')})")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection FAILED!")
        print(f"Error: {str(e)}")
        print()
        print("Common fixes:")
        print("1. Check MONGO_URL in .env is correct")
        print("2. Check IP is whitelisted in Atlas Network Access")
        print("3. Check username/password are correct")
        print("4. Try using local MongoDB instead")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())