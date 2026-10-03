from __future__ import annotations

import hashlib
import json
import uuid
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db.models import (
    Admin,
    AgentRun,
    Approval,
    AuditEvent,
    ChannelIdentity,
    Contact,
    Conversation,
    Message,
    Price,
    Product,
    ProposedActionRow,
    ProposedResponseRow,
    Quote,
    SearchDocument,
    SupportTicket,
    Ticket,
)
from hermesdesk.ids import new_public_id
from hermesdesk.types import InboundMessage, ProposedResponse


async def get_admin_by_email(session: AsyncSession, email: str) -> Admin | None:
    r = await session.execute(select(Admin).where(Admin.email == email))
    return r.scalar_one_or_none()


async def get_admin_by_telegram(session: AsyncSession, tg_id: int) -> Admin | None:
    r = await session.execute(select(Admin).where(Admin.telegram_user_id == tg_id))
    return r.scalar_one_or_none()


async def get_admin(session: AsyncSession, admin_id: uuid.UUID) -> Admin | None:
    return await session.get(Admin, admin_id)


async def upsert_contact_from_inbound(session: AsyncSession, msg: InboundMessage, tenant_id: str) -> tuple[Contact, Conversation]:
    ident = await session.execute(
        select(ChannelIdentity).where(
            ChannelIdentity.channel == msg.channel,
            ChannelIdentity.external_id == msg.external_user_id,
        )
    )
    row = ident.scalar_one_or_none()
    if row:
        contact = await session.get(Contact, row.contact_id)
        assert contact
    else:
        contact = Contact(tenant_id=tenant_id, display_name=msg.display_name, language="ar")
        session.add(contact)
        await session.flush()
        session.add(
            ChannelIdentity(
                contact_id=contact.id,
                channel=msg.channel,
                external_id=msg.external_user_id,
                display=msg.display_name,
            )
        )

    conv = Conversation(
        tenant_id=tenant_id,
        contact_id=contact.id,
        channel=msg.channel,
        external_thread_id=msg.thread_id or msg.external_user_id,
    )
    session.add(conv)
    await session.flush()
    return contact, conv


async def create_ticket(
    session: AsyncSession,
    *,
    tenant_id: str,
    msg: InboundMessage,
    contact: Contact,
    conversation: Conversation,
    raw_key: str | None,
) -> Ticket:
    ticket = Ticket(
        public_id=new_public_id(),
        tenant_id=tenant_id,
        conversation_id=conversation.id,
        contact_id=contact.id,
        channel=msg.channel,
        status="received",
        provider_message_id=msg.provider_message_id,
    )
    session.add(ticket)
    await session.flush()
    session.add(
        Message(
            ticket_id=ticket.id,
            conversation_id=conversation.id,
            role="customer",
            channel=msg.channel,
            text=msg.text,
            raw_r2_key=raw_key,
        )
    )
    await session.flush()
    return ticket


async def get_ticket(session: AsyncSession, ticket_id: uuid.UUID) -> Ticket | None:
    return await session.get(Ticket, ticket_id)


async def get_ticket_by_public(session: AsyncSession, public_id: str) -> Ticket | None:
    r = await session.execute(select(Ticket).where(Ticket.public_id == public_id))
    return r.scalar_one_or_none()


async def set_status(session: AsyncSession, ticket_id: uuid.UUID, status: str, **fields: Any) -> None:
    values = {"status": status, **fields}
    await session.execute(update(Ticket).where(Ticket.id == ticket_id).values(**values))


async def latest_customer_text(session: AsyncSession, ticket_id: uuid.UUID) -> str:
    r = await session.execute(
        select(Message)
        .where(Message.ticket_id == ticket_id, Message.role == "customer")
        .order_by(Message.created_at.desc())
    )
    row = r.scalars().first()
    return row.text if row else ""


async def last_messages(session: AsyncSession, conversation_id: uuid.UUID, limit: int = 20) -> list[Message]:
    r = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    return list(reversed(r.scalars().all()))


async def save_proposal(
    session: AsyncSession,
    ticket: Ticket,
    proposal: ProposedResponse,
    run: AgentRun,
) -> ProposedResponseRow:
    raw = proposal.model_dump()
    digest = hashlib.sha256(json.dumps(raw, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    row = ProposedResponseRow(
        ticket_id=ticket.id,
        agent_run_id=run.id,
        draft_text_ar=proposal.customer_reply_ar,
        rationale_ar=proposal.rationale_ar,
        risk=proposal.risk,
        citations=proposal.citations,
        draft_hash=digest,
        raw_json=raw,
    )
    session.add(row)
    await session.flush()
    for act in proposal.actions:
        session.add(
            ProposedActionRow(
                proposal_id=row.id,
                type=act.type,
                payload=act.payload,
                reversible=act.reversible,
            )
        )
    return row


async def latest_proposal(session: AsyncSession, ticket_id: uuid.UUID) -> ProposedResponseRow | None:
    r = await session.execute(
        select(ProposedResponseRow)
        .where(ProposedResponseRow.ticket_id == ticket_id)
        .order_by(ProposedResponseRow.created_at.desc())
    )
    return r.scalars().first()


async def list_actions(session: AsyncSession, proposal_id: uuid.UUID) -> list[ProposedActionRow]:
    r = await session.execute(select(ProposedActionRow).where(ProposedActionRow.proposal_id == proposal_id))
    return list(r.scalars().all())


async def list_queue(session: AsyncSession, status: str = "awaiting_approval") -> list[Ticket]:
    r = await session.execute(select(Ticket).where(Ticket.status == status).order_by(Ticket.created_at.asc()))
    return list(r.scalars().all())


async def add_audit(session: AsyncSession, *, ticket_id, actor_type: str, actor_id: str | None, event: str, payload: dict) -> None:
    session.add(
        AuditEvent(
            ticket_id=ticket_id,
            actor_type=actor_type,
            actor_id=actor_id,
            event=event,
            payload=payload,
        )
    )


async def search_products(session: AsyncSession, q: str, limit: int = 8) -> list[Product]:
    like = f"%{q}%"
    r = await session.execute(
        select(Product).where(
            Product.is_active.is_(True),
            (Product.sku.ilike(like)) | (Product.name_ar.ilike(like)) | (Product.name_en.ilike(like)),
        ).limit(limit)
    )
    return list(r.scalars().all())


async def get_product(session: AsyncSession, sku: str) -> Product | None:
    return await session.get(Product, sku)


async def get_prices(session: AsyncSession, sku: str) -> list[Price]:
    r = await session.execute(select(Price).where(Price.sku == sku))
    return list(r.scalars().all())


async def add_message(session: AsyncSession, ticket: Ticket, role: str, text: str) -> Message:
    m = Message(
        ticket_id=ticket.id,
        conversation_id=ticket.conversation_id,
        role=role,
        channel=ticket.channel,
        text=text,
    )
    session.add(m)
    await session.flush()
    return m


async def create_quote(session: AsyncSession, ticket: Ticket, currency: str, lines: list[dict], total: float) -> Quote:
    q = Quote(
        ticket_id=ticket.id,
        contact_id=ticket.contact_id,
        status="issued",
        currency=currency,
        lines=lines,
        total=total,
    )
    session.add(q)
    await session.flush()
    return q


async def create_support(session: AsyncSession, ticket: Ticket, severity: str, body_ar: str, category: str | None = None) -> SupportTicket:
    st = SupportTicket(ticket_id=ticket.id, severity=severity, body_ar=body_ar, category=category)
    session.add(st)
    await session.flush()
    return st


async def add_search_doc(session: AsyncSession, ticket_id, r2_key: str, doc_type: str, fts: str) -> None:
    session.add(SearchDocument(ticket_id=ticket_id, r2_key=r2_key, doc_type=doc_type, fts=fts))
