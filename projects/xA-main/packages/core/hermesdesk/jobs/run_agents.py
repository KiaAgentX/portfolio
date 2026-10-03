from __future__ import annotations

import logging
import time
import uuid

from hermesdesk.agents.orchestrator import run_specialists
from hermesdesk.config import get_settings
from hermesdesk.db import repos
from hermesdesk.db.models import AgentRun, Contact
from hermesdesk.db.session import session_scope
from hermesdesk.redisutil.events import publish_admin
from hermesdesk.redisutil.keys import Keys
from hermesdesk.redisutil.queue import enqueue, get_redis
from hermesdesk.storage.paths import agent_key
from hermesdesk.storage.s3 import put_json

log = logging.getLogger(__name__)


async def run(_ctx, ticket_id: str, admin_note: str | None = None) -> None:
    settings = get_settings()
    redis = get_redis()
    async with session_scope() as session:
        ticket = await repos.get_ticket(session, uuid.UUID(ticket_id))
        if not ticket:
            return
        lock = Keys.lock_conv(str(ticket.conversation_id))
        got = await redis.set(lock, ticket_id, nx=True, ex=120)
        if not got:
            await enqueue("run_agents", ticket_id, admin_note, _defer_by=5)
            return
        try:
            await repos.set_status(session, ticket.id, "running")
            contact = await session.get(Contact, ticket.contact_id)
            text = await repos.latest_customer_text(session, ticket.id)
            if admin_note:
                text = text + f"\n\nملاحظة المشرف: {admin_note}"
            t0 = time.perf_counter()
            try:
                proposal = await run_specialists(session, ticket, contact, text)
                err = None
            except Exception as exc:
                log.exception("agent failed")
                proposal = None
                err = str(exc)
            latency = int((time.perf_counter() - t0) * 1000)
            run_row = AgentRun(
                ticket_id=ticket.id,
                specialist=(proposal.specialist if proposal else "support"),
                model=settings.llm_model,
                latency_ms=latency,
                error=err,
            )
            session.add(run_row)
            await session.flush()
            if proposal is None:
                await repos.set_status(session, ticket.id, "needs_human")
                await publish_admin({"type": "needs_human", "ticket_id": ticket_id, "public_id": ticket.public_id})
                return
            try:
                put_json(
                    agent_key(settings.tenant_id, str(ticket.id), str(run_row.id), "output.json"),
                    proposal.model_dump(),
                )
            except Exception:
                log.exception("agent archive failed")
            await repos.save_proposal(session, ticket, proposal, run_row)
            timeout = 60 if proposal.risk == "critical" else settings.approval_timeout_sec
            await repos.set_status(
                session,
                ticket.id,
                "awaiting_approval",
                risk=proposal.risk,
                intent=proposal.specialist,
                specialist=proposal.specialist,
            )
            await redis.set(Keys.approval_ttl(str(ticket.id)), str(run_row.id), ex=timeout)
            await enqueue("timeout", ticket_id, _defer_by=float(timeout))
            await publish_admin(
                {
                    "type": "approval_needed",
                    "ticket_id": str(ticket.id),
                    "public_id": ticket.public_id,
                    "risk": proposal.risk,
                }
            )
        finally:
            await redis.delete(lock)
