from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import get_redis


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/health", "/"}:
            return await call_next(request)
        ip = request.client.host if request.client else "unknown"
        try:
            redis = get_redis()
            key = Keys.rl_ip(ip)
            n = await redis.incr(key)
            if n == 1:
                await redis.expire(key, 60)
            limit = 60 if request.url.path.startswith("/webhooks/") else 120
            if n > limit:
                return JSONResponse({"error": "rate_limited"}, status_code=429)
        except Exception:
            pass
        return await call_next(request)
