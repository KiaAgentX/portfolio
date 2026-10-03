from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TicketOut(BaseModel):
    id: UUID
    public_id: str
    channel: str
    status: str
    risk: str
    intent: str | None
    specialist: str | None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TicketDetail(TicketOut):
    customer_text: str = ""
    draft_text_ar: str = ""
    rationale_ar: str = ""
    citations: list = []
    actions: list = []
    proposal_id: str | None = None
    contact_name: str | None = None
    lead_score: int | None = None
