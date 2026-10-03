from __future__ import annotations

import logging
import uuid

from hermesdesk.channels.base import get_adapter
from hermesdesk.db import repos
from hermesdesk.db.models import ChannelIdentity
from hermesdesk.db.session import session_scope
from hermesdesk.redisutil.events import publish_admin
from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import enqueue, get_redis
from sqlalchemy import select

log = logging.getLogger(__name__)

FALLBACK = "نعتذر عن التأخير. سيتواصل معكم أحد المختصين قريباً."


async def run(_ctx, ticket_id: str) -> None:
    redis = get_redis()
    lock = Keys.lock_ticket(ticket_id)
    if not await redis.set(lock, "timeout", nx=True, ex=60):
        return
    try:
        async with session_scope() as session:
            ticket = await repos.get_ticket(session, uuid.UUID(ticket_id))
            if not ticket or ticket.status != "awaiting_approval":
                return
            await repos.set_status(session, ticket.id, "expired")
            ident = await session.scalar(
                select(ChannelIdentity).where(
                    ChannelIdentity.contact_id == ticket.contact_id,
                    ChannelIdentity.channel == ticket.channel,
                )
            )
            to = ident.external_id if ident else None
            if to:
                try:
                    await get_adapter(ticket.channel).send_text(to, FALLBACK)
                except Exception:
                    log.exception("fallback send failed")
            await repos.add_message(session, ticket, "system", FALLBACK)
            await repos.add_audit(
                session,
                ticket_id=ticket.id,
                actor_type="system",
                actor_id="timeout",
                event="expired",
                payload={},
            )
            await publish_admin({"type": "expired", "ticket_id": ticket_id, "public_id": ticket.public_id})
        await enqueue("archive", ticket_id)
    finally:
        await redis.delete(lock)
