from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import get_settings
from hermesdesk.types import InboundMessage

from app.deps import db_session
from app.services import ingest_inbound

router = APIRouter(prefix="/webhooks/telegram", tags=["webhooks"])


@router.post("")
async def telegram_webhook(
    request: Request,
    session: AsyncSession = Depends(db_session),
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    settings = get_settings()
    if settings.telegram_customer_secret_token:
        if x_telegram_bot_api_secret_token != settings.telegram_customer_secret_token:
            raise HTTPException(403, "bad secret")
    body = await request.json()
    message = body.get("message") or body.get("edited_message") or {}
    text = message.get("text") or message.get("caption") or ""
    user = message.get("from") or {}
    chat = message.get("chat") or {}
    if not text or not user:
        return {"ok": True, "ignored": True}
    msg = InboundMessage(
        channel="telegram",
        external_user_id=str(chat.get("id") or user.get("id")),
        display_name=" ".join(filter(None, [user.get("first_name"), user.get("last_name")])),
        text=text,
        provider_message_id=str(message.get("message_id")),
        thread_id=str(chat.get("id")),
        reply_to=str(message["message_id"]) if message.get("message_id") else None,
        raw=body,
    )
    result = await ingest_inbound(session, msg)
    return {"ok": True, **result}
