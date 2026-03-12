"""Redis-backed job queue configuration using arq."""

from arq import create_pool
from arq.connections import RedisSettings

from src.config import get_settings

settings = get_settings()

REDIS_SETTINGS = RedisSettings(
    host=getattr(settings, 'redis_host', 'localhost'),
    port=getattr(settings, 'redis_port', 6379),
)


async def get_redis_pool():
    """Create and return an arq Redis connection pool."""
    return await create_pool(REDIS_SETTINGS)
