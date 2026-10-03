from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db import repos
from hermesdesk.db.models import Contact

from app.deps import current_admin, db_session
from app.schemas.ticket import TicketDetail, TicketOut

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.get("", response_model=list[TicketOut])
async def list_tickets(status: str | None = None, session: AsyncSession = Depends(db_session), _=Depends(current_admin)):
    rows = await repos.list_queue(session, status or "awaiting_approval")
    return rows


@router.get("/{ticket_id}", response_model=TicketDetail)
async def get_ticket(ticket_id: uuid.UUID, session: AsyncSession = Depends(db_session), _=Depends(current_admin)):
    ticket = await repos.get_ticket(session, ticket_id)
    if not ticket:
        raise HTTPException(404, "not found")
    contact = await session.get(Contact, ticket.contact_id)
    text = await repos.latest_customer_text(session, ticket.id)
    proposal = await repos.latest_proposal(session, ticket.id)
    actions = []
    draft = rationale = ""
    citations = []
    proposal_id = None
    if proposal:
        proposal_id = str(proposal.id)
        draft = proposal.draft_text_ar
        rationale = proposal.rationale_ar
        citations = proposal.citations or []
        actions = [
            {"id": str(a.id), "type": a.type, "payload": a.payload}
            for a in await repos.list_actions(session, proposal.id)
        ]
    return TicketDetail(
        id=ticket.id,
        public_id=ticket.public_id,
        channel=ticket.channel,
        status=ticket.status,
        risk=ticket.risk,
        intent=ticket.intent,
        specialist=ticket.specialist,
        created_at=ticket.created_at,
        customer_text=text,
        draft_text_ar=draft,
        rationale_ar=rationale,
        citations=citations,
        actions=actions,
        proposal_id=proposal_id,
        contact_name=contact.display_name if contact else None,
        lead_score=contact.lead_score if contact else None,
    )
