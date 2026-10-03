from __future__ import annotations

import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import get_settings
from hermesdesk.db import repos
from hermesdesk.redisutil.events import publish_admin
from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import enqueue, get_redis
from hermesdesk.security.validate import validate_inbound_text
from hermesdesk.storage.paths import inbound_key
from hermesdesk.storage.s3 import put_json
from hermesdesk.types import InboundMessage

log = logging.getLogger(__name__)


async def ingest_inbound(session: AsyncSession, msg: InboundMessage) -> dict:
    settings = get_settings()
    msg.text = validate_inbound_text(msg.text)
    redis = get_redis()
    dedup = Keys.dedup(msg.channel, msg.provider_message_id)
    if await redis.set(dedup, "1", nx=True, ex=7 * 24 * 3600) is None:
        return {"dedup": True}

    ident_key = Keys.rl_ident(msg.channel, msg.external_user_id)
    n = await redis.incr(ident_key)
    if n == 1:
        await redis.expire(ident_key, 600)
    if n > 10:
        return {"error": "rate_limited"}

    raw_key = inbound_key(settings.tenant_id, msg.provider_message_id)
    try:
        put_json(raw_key, msg.model_dump())
    except Exception:
        log.exception("r2 inbound failed")
        raw_key = None

    contact, conv = await repos.upsert_contact_from_inbound(session, msg, settings.tenant_id)
    ticket = await repos.create_ticket(
        session, tenant_id=settings.tenant_id, msg=msg, contact=contact, conversation=conv, raw_key=raw_key
    )
    await repos.add_audit(
        session,
        ticket_id=ticket.id,
        actor_type="system",
        actor_id="ingress",
        event="received",
        payload={"channel": msg.channel},
    )
    await session.commit()
    await enqueue("ingest", str(ticket.id), msg.external_user_id)
    await publish_admin({"type": "ticket_received", "ticket_id": str(ticket.id), "public_id": ticket.public_id})
    return {"ticket_id": str(ticket.id), "public_id": ticket.public_id}
