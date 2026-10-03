from __future__ import annotations

import uuid

from hermesdesk.config import get_settings
from hermesdesk.db import repos
from hermesdesk.db.session import session_scope
from hermesdesk.storage.parquet_archive import write_transcript


async def run(_ctx, ticket_id: str) -> None:
    settings = get_settings()
    async with session_scope() as session:
        ticket = await repos.get_ticket(session, uuid.UUID(ticket_id))
        if not ticket:
            return
        text = await repos.latest_customer_text(session, ticket.id)
        proposal = await repos.latest_proposal(session, ticket.id)
        record = {
            "ticket_id": str(ticket.id),
            "public_id": ticket.public_id,
            "channel": ticket.channel,
            "contact_id": str(ticket.contact_id),
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "customer_text": text,
            "final_text_ar": proposal.draft_text_ar if proposal else "",
            "specialist": ticket.specialist,
            "risk": ticket.risk,
            "status": ticket.status,
        }
        try:
            keys = write_transcript(tenant=settings.tenant_id, ticket_id=str(ticket.id), record=record)
        except Exception:
            keys = {}
        if keys.get("json"):
            await repos.add_search_doc(session, ticket.id, keys["json"], "transcript", text)
        if ticket.status in {"sent", "expired", "needs_human", "failed", "rejected"}:
            await repos.set_status(session, ticket.id, "archived")
