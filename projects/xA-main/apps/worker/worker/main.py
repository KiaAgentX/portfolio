from hermesdesk.db.models import Base
from hermesdesk.db.session import init_engine
from hermesdesk.jobs.archive import run as archive_run
from hermesdesk.jobs.ingest import run as ingest_run
from hermesdesk.jobs.run_agents import run as run_agents_run
from hermesdesk.jobs.send import run as send_run
from hermesdesk.jobs.timeout import run as timeout_run
from hermesdesk.redisutil.queue import redis_settings


async def startup(ctx):
    engine = init_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def ingest(ctx, ticket_id: str, external_user_id: str):
    return await ingest_run(ctx, ticket_id, external_user_id)


async def run_agents(ctx, ticket_id: str, admin_note: str | None = None):
    return await run_agents_run(ctx, ticket_id, admin_note)


async def timeout(ctx, ticket_id: str):
    return await timeout_run(ctx, ticket_id)


async def send(ctx, ticket_id: str, final_text: str, action_ids: list[str] | None = None):
    return await send_run(ctx, ticket_id, final_text, action_ids)


async def archive(ctx, ticket_id: str):
    return await archive_run(ctx, ticket_id)


class WorkerSettings:
    functions = [ingest, run_agents, timeout, send, archive]
    redis_settings = redis_settings()
    on_startup = startup
    max_jobs = 8
    job_timeout = 180
    keep_result = 3600
