"""Rate limiting middleware for API endpoints with Redis distributed support."""

import time
from typing import Dict, Optional, Tuple
from collections import defaultdict
from fastapi import Request, HTTPException, status
from app.utils.logger import get_logger
from app.utils.config import get_settings
from app.utils.cache import get_async_cache, AsyncRedisCache

logger = get_logger(__name__)


class DistributedRateLimiter:
    """Distributed Redis sliding window rate limiter with in-memory fallback."""

    def __init__(self):
        self.settings = get_settings()
        self.in_memory_requests: Dict[str, list] = defaultdict(list)

    async def is_allowed(self, identifier: str) -> Tuple[bool, int]:
        """Check if request is allowed. Returns (allowed, remaining)."""
        if not self.settings.rate_limit_enabled:
            return True, self.settings.rate_limit_requests

        now = time.time()
        period = self.settings.rate_limit_period
        limit = self.settings.rate_limit_requests
        window_start = now - period

        cache = get_async_cache()
        if isinstance(cache, AsyncRedisCache) and cache.client:
            key = f"rate_limit:{identifier}"
            try:
                pipe = cache.client.pipeline()
                pipe.zremrangebyscore(key, 0, window_start)
                pipe.zadd(key, {str(now): now})
                pipe.zcard(key)
                pipe.expire(key, period)
                res = await pipe.execute()
                current_count = res[2]

                allowed = current_count <= limit
                remaining = max(0, limit - current_count)
                return allowed, remaining
            except Exception as e:
                logger.error(f"Redis rate limiter error, falling back to in-memory: {e}")

        # In-memory fallback
        reqs = [t for t in self.in_memory_requests[identifier] if t > window_start]
        reqs.append(now)
        self.in_memory_requests[identifier] = reqs

        allowed = len(reqs) <= limit
        remaining = max(0, limit - len(reqs))
        return allowed, remaining


_limiter: Optional[DistributedRateLimiter] = None


def get_rate_limiter() -> DistributedRateLimiter:
    global _limiter
    if _limiter is None:
        _limiter = DistributedRateLimiter()
    return _limiter


async def rate_limit_middleware(request: Request, call_next):
    """FastAPI rate limiting middleware."""
    settings = get_settings()
    if not settings.rate_limit_enabled:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    limiter = get_rate_limiter()
    allowed, remaining = await limiter.is_allowed(client_ip)

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "limit": settings.rate_limit_requests,
                "period": settings.rate_limit_period,
                "remaining": 0,
                "retry_after": settings.rate_limit_period
            },
            headers={
                "X-RateLimit-Limit": str(settings.rate_limit_requests),
                "X-RateLimit-Period": str(settings.rate_limit_period),
                "X-RateLimit-Remaining": "0",
                "Retry-After": str(settings.rate_limit_period)
            }
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
    response.headers["X-RateLimit-Period"] = str(settings.rate_limit_period)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response
