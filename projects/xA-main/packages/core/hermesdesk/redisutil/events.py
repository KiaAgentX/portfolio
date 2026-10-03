from __future__ import annotations

import json

from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import get_redis


async def publish_admin(event: dict) -> None:
    redis = get_redis()
    await redis.publish(Keys.SSE, json.dumps(event, ensure_ascii=False))
