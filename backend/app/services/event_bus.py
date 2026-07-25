"""Redis Pub/Sub EventBus for real-time verification workflow progress streaming."""

import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
from datetime import datetime
from app.utils.config import get_settings
from app.utils.logger import get_logger
from app.utils.cache import get_async_cache, AsyncRedisCache

logger = get_logger(__name__)


class EventBus:
    """EventBus managing Redis Pub/Sub channels and event history playback."""

    def __init__(self):
        self.settings = get_settings()

    async def publish_event(
        self,
        verification_id: int,
        event_type: str,
        progress: int,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a verification lifecycle event to Redis Pub/Sub and cache in event history."""
        event_data = {
            "verification_id": verification_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": event_type,
            "progress": progress,
            "payload": payload
        }
        
        channel_name = f"verification:{verification_id}"
        history_key = f"verification:{verification_id}:events"
        event_json = json.dumps(event_data)

        cache = get_async_cache()
        if isinstance(cache, AsyncRedisCache) and cache.client:
            try:
                # Publish event to channel
                await cache.client.publish(channel_name, event_json)
                # Store event in list for late-connecting clients
                pipe = cache.client.pipeline()
                pipe.rpush(history_key, event_json)
                pipe.expire(history_key, 3600)  # 1 hour retention
                await pipe.execute()
                logger.info(f"Published '{event_type}' ({progress}%) to Redis channel {channel_name}")
            except Exception as e:
                logger.error(f"Error publishing event to Redis Pub/Sub: {e}")
        else:
            logger.warning(f"Redis unavailable; event '{event_type}' logged locally.")

        return event_data

    async def subscribe_events(self, verification_id: int) -> AsyncGenerator[str, None]:
        """Subscribe to Redis Pub/Sub channel and yield historical and live events formatted for SSE."""
        channel_name = f"verification:{verification_id}"
        history_key = f"verification:{verification_id}:events"
        cache = get_async_cache()

        yielded_history = set()
        redis_available = False

        if isinstance(cache, AsyncRedisCache) and cache.client:
            try:
                # Step 1: Replay historical events
                history = await cache.client.lrange(history_key, 0, -1)
                for raw_event in history:
                    yielded_history.add(raw_event)
                    yield f"data: {raw_event}\n\n"

                # Step 2: Subscribe to live events
                pubsub = cache.client.pubsub()
                await pubsub.subscribe(channel_name)
                redis_available = True
                try:
                    while True:
                        message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                        if message and message.get("type") == "message":
                            data_str = message.get("data")
                            if data_str and data_str not in yielded_history:
                                yield f"data: {data_str}\n\n"
                                # Exit generator if verification reached terminal state
                                try:
                                    parsed = json.loads(data_str)
                                    if parsed.get("event_type") in ("verification_completed", "verification_failed"):
                                        break
                                except Exception:
                                    pass
                        await asyncio.sleep(0.1)
                finally:
                    await pubsub.unsubscribe(channel_name)
                    await pubsub.close()
            except Exception as e:
                logger.warning(f"Redis Pub/Sub unavailable, falling back to polling mode: {e}")
                redis_available = False

        if not redis_available:
            # Fallback for environment without Redis connection
            fallback_event = json.dumps({
                "verification_id": verification_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "event_type": "status_update",
                "progress": 0,
                "payload": {"message": "Redis unavailable. Use GET /report/{id} to poll for results."}
            })
            yield f"data: {fallback_event}\n\n"


_event_bus: Optional[EventBus] = None


def get_event_bus() -> EventBus:
    global _event_bus
    if _event_bus is None:
        _event_bus = EventBus()
    return _event_bus
