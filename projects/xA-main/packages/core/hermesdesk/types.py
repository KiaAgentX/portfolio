from __future__ import annotations

from typing import Any, Literal, Protocol

from pydantic import BaseModel, Field

ChannelName = Literal["telegram", "whatsapp", "email"]
TicketStatus = Literal[
    "received",
    "acked",
    "running",
    "awaiting_approval",
    "approved",
    "rejected",
    "sending",
    "sent",
    "expired",
    "failed",
    "needs_human",
    "archived",
]
Risk = Literal["low", "medium", "high", "critical"]
Intent = Literal["knowledge", "sales", "support", "other"]
Specialist = Literal["knowledge", "customer", "sales", "support", "analytics"]


class InboundMessage(BaseModel):
    channel: ChannelName
    external_user_id: str
    display_name: str | None = None
    text: str
    provider_message_id: str
    thread_id: str | None = None
    reply_to: str | None = None
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    raw: dict[str, Any] = Field(default_factory=dict)


class ProposedAction(BaseModel):
    type: Literal["draft_quote", "create_support_ticket", "upsert_contact", "none"]
    payload: dict[str, Any] = Field(default_factory=dict)
    reversible: bool = True


class ProposedResponse(BaseModel):
    customer_reply_ar: str = Field(min_length=2, max_length=4000)
    customer_reply_en: str | None = None
    rationale_ar: str
    risk: Risk = "low"
    specialist: Specialist
    citations: list[str] = Field(default_factory=list)
    actions: list[ProposedAction] = Field(default_factory=list)
    language: Literal["ar"] = "ar"
    lead_score: int | None = None


class ChannelAdapter(Protocol):
    name: str

    async def send_text(self, to: str, text: str, *, reply_to: str | None = None) -> str: ...

    async def send_document(self, to: str, r2_key: str, filename: str) -> str: ...

    async def ack_received(self, to: str, ticket_id: str) -> None: ...
