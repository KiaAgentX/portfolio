from __future__ import annotations

import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db import repos
from hermesdesk.db.models import Approval
from hermesdesk.redisutil.events import publish_admin
from hermesdesk.redisutil.queue import enqueue

from app.deps import approver_admin, db_session
from app.schemas.approval import ApproveIn, RejectIn

router = APIRouter(prefix="/api/approvals", tags=["approvals"])


@router.post("/{ticket_id}/approve")
async def approve(
    ticket_id: uuid.UUID,
    body: ApproveIn,
    session: AsyncSession = Depends(db_session),
    admin=Depends(approver_admin),
):
    ticket = await repos.get_ticket(session, ticket_id)
    if not ticket or ticket.status != "awaiting_approval":
        raise HTTPException(409, "not awaiting approval")
    proposal = await repos.latest_proposal(session, ticket.id)
    if not proposal:
        raise HTTPException(409, "no proposal")
    final = body.final_text_ar or proposal.draft_text_ar
    final_hash = hashlib.sha256(final.encode()).hexdigest()
    session.add(
        Approval(
            ticket_id=ticket.id,
            proposal_id=proposal.id,
            admin_id=admin.id,
            decision="approved",
            final_text_ar=final,
            final_hash=final_hash,
            reason=body.note,
            selected_action_ids=[uuid.UUID(x) for x in body.action_ids] if body.action_ids else None,
        )
    )
    await repos.set_status(session, ticket.id, "approved")
    await repos.add_audit(
        session,
        ticket_id=ticket.id,
        actor_type="admin",
        actor_id=str(admin.id),
        event="approved",
        payload={"final_hash": final_hash},
    )
    await session.commit()
    action_ids = body.action_ids
    await enqueue("send", str(ticket.id), final, action_ids)
    await publish_admin({"type": "approved", "ticket_id": str(ticket.id), "public_id": ticket.public_id})
    return {"ok": True, "status": "approved"}


@router.post("/{ticket_id}/reject")
async def reject(
    ticket_id: uuid.UUID,
    body: RejectIn,
    session: AsyncSession = Depends(db_session),
    admin=Depends(approver_admin),
):
    ticket = await repos.get_ticket(session, ticket_id)
    if not ticket or ticket.status != "awaiting_approval":
        raise HTTPException(409, "not awaiting approval")
    proposal = await repos.latest_proposal(session, ticket.id)
    if not proposal:
        raise HTTPException(409, "no proposal")
    session.add(
        Approval(
            ticket_id=ticket.id,
            proposal_id=proposal.id,
            admin_id=admin.id,
            decision="rejected",
            reason=body.reason,
        )
    )
    await repos.add_audit(
        session,
        ticket_id=ticket.id,
        actor_type="admin",
        actor_id=str(admin.id),
        event="rejected",
        payload={"reason": body.reason},
    )
    if body.requeue and ticket.rerun_count < 2:
        await repos.set_status(session, ticket.id, "received", rerun_count=ticket.rerun_count + 1)
        await session.commit()
        await enqueue("run_agents", str(ticket.id), body.reason)
        return {"ok": True, "status": "requeued"}
    await repos.set_status(session, ticket.id, "needs_human")
    await session.commit()
    await enqueue("archive", str(ticket.id))
    await publish_admin({"type": "rejected", "ticket_id": str(ticket.id)})
    return {"ok": True, "status": "needs_human"}
