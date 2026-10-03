from __future__ import annotations

import logging
import uuid

from sqlalchemy import select

from hermesdesk.channels.base import get_adapter
from hermesdesk.db import repos
from hermesdesk.db.models import ChannelIdentity, ProposedActionRow, Quote
from hermesdesk.db.session import session_scope
from hermesdesk.redisutil.events import publish_admin
from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import enqueue, get_redis

log = logging.getLogger(__name__)


async def run(_ctx, ticket_id: str, final_text: str, action_ids: list[str] | None = None) -> None:
    redis = get_redis()
    lock = Keys.lock_ticket(ticket_id)
    if not await redis.set(lock, "send", nx=True, ex=60):
        return
    try:
        async with session_scope() as session:
            ticket = await repos.get_ticket(session, uuid.UUID(ticket_id))
            if not ticket or ticket.status not in {"approved", "sending"}:
                return
            await repos.set_status(session, ticket.id, "sending")
            proposal = await repos.latest_proposal(session, ticket.id)
            actions = await repos.list_actions(session, proposal.id) if proposal else []
            selected = set(action_ids or [])
            for act in actions:
                if selected and str(act.id) not in selected:
                    continue
                await _exec_action(session, ticket, act)
            ident = await session.scalar(
                select(ChannelIdentity).where(
                    ChannelIdentity.contact_id == ticket.contact_id,
                    ChannelIdentity.channel == ticket.channel,
                )
            )
            to = ident.external_id if ident else None
            if to:
                try:
                    await get_adapter(ticket.channel).send_text(to, final_text)
                except Exception:
                    log.exception("send failed")
                    await repos.set_status(session, ticket.id, "failed")
                    return
            await repos.add_message(session, ticket, "assistant", final_text)
            await repos.set_status(session, ticket.id, "sent")
            await publish_admin({"type": "sent", "ticket_id": ticket_id, "public_id": ticket.public_id})
        await enqueue("archive", ticket_id)
    finally:
        await redis.delete(lock)


async def _exec_action(session, ticket, act: ProposedActionRow) -> None:
    if act.type == "draft_quote":
        payload = act.payload or {}
        lines = payload.get("lines") or []
        total = float(payload.get("total") or 0)
        currency = payload.get("currency") or "USD"
        q = await repos.create_quote(session, ticket, currency, lines, total)
        q.status = "issued"
    elif act.type == "create_support_ticket":
        payload = act.payload or {}
        await repos.create_support(
            session,
            ticket,
            payload.get("severity") or ticket.risk,
            payload.get("body_ar") or "",
            payload.get("category"),
        )
    elif act.type == "upsert_contact":
        from hermesdesk.db.models import Contact

        contact = await session.get(Contact, ticket.contact_id)
        if contact:
            for k in ("company", "country", "city", "display_name"):
                if payload := (act.payload or {}).get(k):
                    setattr(contact, k, payload)
