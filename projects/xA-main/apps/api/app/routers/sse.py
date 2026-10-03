import asyncio
import json

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import get_redis

from app.deps import current_admin

router = APIRouter(prefix="/api", tags=["sse"])


@router.get("/events")
async def events(_=Depends(current_admin)):
    async def gen():
        pubsub = get_redis().pubsub()
        await pubsub.subscribe(Keys.SSE)
        try:
            yield {"event": "ready", "data": json.dumps({"ok": True})}
            while True:
                msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=15)
                if msg and msg.get("data"):
                    data = msg["data"]
                    if isinstance(data, bytes):
                        data = data.decode()
                    yield {"event": "desk", "data": data}
                else:
                    yield {"event": "ping", "data": "{}"}
                await asyncio.sleep(0.05)
        finally:
            await pubsub.unsubscribe(Keys.SSE)

    return EventSourceResponse(gen())
