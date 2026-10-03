from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db.models import Ticket


async def tool_query_metrics(session: AsyncSession) -> dict:
    total = await session.scalar(select(func.count()).select_from(Ticket))
    awaiting = await session.scalar(
        select(func.count()).select_from(Ticket).where(Ticket.status == "awaiting_approval")
    )
    expired = await session.scalar(
        select(func.count()).select_from(Ticket).where(Ticket.status == "expired")
    )
    sent = await session.scalar(select(func.count()).select_from(Ticket).where(Ticket.status == "sent"))
    return {
        "tickets_total": int(total or 0),
        "awaiting_approval": int(awaiting or 0),
        "expired": int(expired or 0),
        "sent": int(sent or 0),
    }
