"""Caching mechanism for performance optimization using Redis."""

import json
import time
from typing import Any, Optional, Dict
from app.utils.logger import get_logger
from app.utils.config import get_settings

try:
    import redis.asyncio as aioredis
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger = get_logger(__name__)
    logger.warning("Redis not available, falling back to in-memory cache")


class AsyncRedisCache:
    """Async Redis-backed cache with TTL support."""

    def __init__(self, redis_url: str = None, ttl: int = 300):
        self.redis_url = redis_url or "redis://localhost:6379/0"
        self.ttl = ttl
        self.logger = get_logger(__name__)
        self.client: Optional[aioredis.Redis] = None
        if REDIS_AVAILABLE:
            try:
                self.client = aioredis.from_url(self.redis_url, decode_responses=True)
            except Exception as e:
                self.logger.error(f"Failed to initialize async Redis client: {e}")

    async def ping(self) -> bool:
        """Check if Redis connection is healthy."""
        if not self.client:
            return False
        try:
            return await self.client.ping()
        except Exception:
            return False

    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis asynchronously."""
        if not self.client:
            return None
        try:
            val = await self.client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            self.logger.error(f"Error getting key '{key}' from Redis: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set key-value pair in Redis asynchronously with TTL."""
        if not self.client:
            return
        try:
            serialized = json.dumps(value)
            expiry = ttl or self.ttl
            await self.client.setex(key, expiry, serialized)
        except Exception as e:
            self.logger.error(f"Error setting key '{key}' in Redis: {e}")

    async def delete(self, key: str) -> None:
        """Delete key from Redis asynchronously."""
        if not self.client:
            return
        try:
            await self.client.delete(key)
        except Exception as e:
            self.logger.error(f"Error deleting key '{key}' from Redis: {e}")


class SimpleCache:
    """Fallback in-memory cache with TTL support."""
    
    def __init__(self, ttl: int = 300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl
        self.logger = get_logger(__name__)
    
    async def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        entry = self.cache[key]
        if time.time() > entry["expires_at"]:
            del self.cache[key]
            return None
        return entry["value"]
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        expires_at = time.time() + (ttl or self.ttl)
        self.cache[key] = {"value": value, "expires_at": expires_at}
    
    async def delete(self, key: str) -> None:
        if key in self.cache:
            del self.cache[key]

    async def ping(self) -> bool:
        return True


_async_cache: Optional[Any] = None


def get_async_cache(ttl: int = None) -> Any:
    """Get the global async cache instance."""
    global _async_cache
    if _async_cache is None:
        settings = get_settings()
        cache_ttl = ttl or settings.cache_ttl_seconds
        if settings.cache_enabled and REDIS_AVAILABLE:
            _async_cache = AsyncRedisCache(redis_url=settings.redis_url, ttl=cache_ttl)
        else:
            _async_cache = SimpleCache(ttl=cache_ttl)
    return _async_cache


# Backward compatibility alias
get_cache = get_async_cache

