from __future__ import annotations

from functools import lru_cache

from arq import create_pool
from arq.connections import ArqRedis, RedisSettings
from redis.asyncio import Redis

from hermesdesk.config import get_settings


def redis_settings() -> RedisSettings:
    return RedisSettings.from_dsn(get_settings().redis_url)


@lru_cache
def get_redis() -> Redis:
    return Redis.from_url(get_settings().redis_url, decode_responses=True)


_pool: ArqRedis | None = None


async def arq_pool() -> ArqRedis:
    global _pool
    if _pool is None:
        _pool = await create_pool(redis_settings())
    return _pool


async def enqueue(job: str, *args, _defer_by: float | None = None, **kwargs):
    settings = get_settings()
    if settings.dev_inline_jobs:
        if _defer_by:
            return None
        from hermesdesk.jobs.archive import run as archive
        from hermesdesk.jobs.ingest import run as ingest
        from hermesdesk.jobs.run_agents import run as run_agents
        from hermesdesk.jobs.send import run as send
        from hermesdesk.jobs.timeout import run as timeout

        mapping = {
            "ingest": ingest,
            "run_agents": run_agents,
            "timeout": timeout,
            "send": send,
            "archive": archive,
        }
        await mapping[job](None, *args, **kwargs)
        return None
    pool = await arq_pool()
    return await pool.enqueue_job(job, *args, _defer_by=_defer_by, **kwargs)
