from __future__ import annotations

import bleach
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import get_settings
from hermesdesk.types import InboundMessage

from app.deps import db_session
from app.services import ingest_inbound

router = APIRouter(prefix="/webhooks/email", tags=["webhooks"])


@router.post("")
async def email_inbound(
    request: Request,
    session: AsyncSession = Depends(db_session),
    x_inbound_secret: str | None = Header(default=None),
):
    s = get_settings()
    body = await request.json()
    secret = x_inbound_secret or body.get("secret")
    if s.email_inbound_secret and secret != s.email_inbound_secret:
        raise HTTPException(403, "bad secret")
    frm = body.get("from") or body.get("from_email") or ""
    if isinstance(frm, dict):
        frm = frm.get("email") or ""
    text = body.get("text") or ""
    if not text and body.get("html"):
        text = bleach.clean(body["html"], tags=[], strip=True)
    subject = body.get("subject") or ""
    combined = f"{subject}\n{text}".strip()
    msg = InboundMessage(
        channel="email",
        external_user_id=str(frm),
        display_name=str(frm),
        text=combined,
        provider_message_id=str(body.get("id") or body.get("email_id") or combined[:40]),
        thread_id=str(frm),
        raw=body,
    )
    return {"ok": True, **(await ingest_inbound(session, msg))}
