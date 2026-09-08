import os
import redis.asyncio as aioredis

# Read Redis connection string from environment variables (.env or Railway)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Asynchronous Redis client instance connected to the Redis service
redis_client = aioredis.from_url(
    REDIS_URL,
    decode_responses=True,
    encoding="utf-8"
)

async def get_redis():
    """
    FastAPI dependency that provides the active Redis connection 
    to route endpoints via Depends(get_redis).
    """
    return redis_client