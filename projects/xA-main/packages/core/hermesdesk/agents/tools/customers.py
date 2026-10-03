from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db.models import Contact


async def tool_get_contact(session: AsyncSession, contact_id) -> dict:
    c = await session.get(Contact, contact_id)
    if not c:
        return {}
    return {
        "id": str(c.id),
        "display_name": c.display_name,
        "company": c.company,
        "country": c.country,
        "city": c.city,
        "lead_score": c.lead_score,
    }
