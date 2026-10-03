from __future__ import annotations

import logging
import uuid

from hermesdesk.channels.base import get_adapter
from hermesdesk.config import get_settings
from hermesdesk.db import repos
from hermesdesk.db.session import session_scope
from hermesdesk.redisutil.queue import enqueue

log = logging.getLogger(__name__)


async def run(_ctx, ticket_id: str, external_user_id: str) -> None:
    settings = get_settings()
    async with session_scope() as session:
        ticket = await repos.get_ticket(session, uuid.UUID(ticket_id))
        if not ticket:
            return
        if settings.ack_on_ingest and ticket.status == "received":
            try:
                adapter = get_adapter(ticket.channel)
                await adapter.ack_received(external_user_id, ticket.public_id)
            except Exception:
                log.exception("ack failed")
            await repos.set_status(session, ticket.id, "acked")
            await repos.add_message(session, ticket, "system", f"ACK {ticket.public_id}")
    await enqueue("run_agents", ticket_id, None)
