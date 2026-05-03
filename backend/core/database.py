from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.MONGO_DB]

    # Create indexes for fast queries
    await db.users.create_index("email", unique=True)
    await db.otp_store.create_index("expires_at", expireAfterSeconds=0)
    await db.token_blacklist.create_index("expires_at", expireAfterSeconds=0)
    await db.groups.create_index("invite_code")
    await db.expenses.create_index([("group_id", 1), ("date", -1)])
    await db.notifications.create_index([("user_id", 1), ("read", 1)])
    await db.activity.create_index([("user_id", 1), ("created_at", -1)])
    await db.settlements.create_index([("from_user_id", 1), ("status", 1)])

    print(f"✅ Connected to MongoDB: {settings.MONGO_DB}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("MongoDB disconnected")


def get_db():
    return db
