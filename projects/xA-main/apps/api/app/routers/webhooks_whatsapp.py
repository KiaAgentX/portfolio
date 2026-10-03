from __future__ import annotations

import hashlib
import hmac
import json

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import get_settings
from hermesdesk.types import InboundMessage

from app.deps import db_session
from app.services import ingest_inbound

router = APIRouter(prefix="/webhooks/whatsapp", tags=["webhooks"])


@router.get("")
async def verify(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_challenge: str | None = Query(default=None, alias="hub.challenge"),
    hub_verify_token: str | None = Query(default=None, alias="hub.verify_token"),
):
    s = get_settings()
    if hub_mode == "subscribe" and hub_verify_token == s.meta_verify_token:
        return int(hub_challenge or 0)
    raise HTTPException(403, "verify failed")


def _valid_meta(raw: bytes, signature: str | None, secret: str) -> bool:
    if not secret:
        return True
    if not signature or not signature.startswith("sha256="):
        return False
    digest = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature.split("=", 1)[1])


@router.post("")
async def whatsapp_webhook(
    request: Request,
    session: AsyncSession = Depends(db_session),
    x_hub_signature_256: str | None = Header(default=None),
):
    s = get_settings()
    raw = await request.body()
    if s.whatsapp_provider == "meta" and not _valid_meta(raw, x_hub_signature_256, s.meta_app_secret):
        raise HTTPException(403, "bad signature")

    if s.whatsapp_provider == "twilio":
        form = dict(await request.form())
        body = form.get("Body") or ""
        frm = form.get("From") or ""
        sid = form.get("MessageSid") or form.get("SmsSid") or ""
        if not body:
            return {"ok": True}
        msg = InboundMessage(
            channel="whatsapp",
            external_user_id=frm,
            display_name=form.get("ProfileName"),
            text=str(body),
            provider_message_id=str(sid),
            thread_id=frm,
            raw=form,
        )
        return {"ok": True, **(await ingest_inbound(session, msg))}

    body = json.loads(raw or b"{}")
    results = []
    for entry in body.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value") or {}
            for m in value.get("messages", []) or []:
                text = (m.get("text") or {}).get("body") or ""
                if not text:
                    continue
                msg = InboundMessage(
                    channel="whatsapp",
                    external_user_id=m.get("from", ""),
                    text=text,
                    provider_message_id=m.get("id", ""),
                    thread_id=m.get("from", ""),
                    raw=m,
                )
                results.append(await ingest_inbound(session, msg))
    return {"ok": True, "results": results}
