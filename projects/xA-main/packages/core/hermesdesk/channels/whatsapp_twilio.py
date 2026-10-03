from __future__ import annotations

import httpx

from hermesdesk.config import get_settings


class WhatsAppTwilioAdapter:
    name = "whatsapp"

    async def send_text(self, to: str, text: str, *, reply_to: str | None = None) -> str:
        s = get_settings()
        if not s.twilio_account_sid or not s.twilio_auth_token:
            return "dry-run"
        url = f"https://api.twilio.com/2010-04-01/Accounts/{s.twilio_account_sid}/Messages.json"
        data = {
            "From": s.twilio_whatsapp_from,
            "To": to if to.startswith("whatsapp:") else f"whatsapp:{to}",
            "Body": text,
        }
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(url, data=data, auth=(s.twilio_account_sid, s.twilio_auth_token))
            r.raise_for_status()
            return r.json().get("sid", "")

    async def send_document(self, to: str, r2_key: str, filename: str) -> str:
        return await self.send_text(to, f"مرفق: {filename}")

    async def ack_received(self, to: str, ticket_id: str) -> None:
        await self.send_text(to, f"تم استلام رسالتكم. رقم المتابعة {ticket_id}.")
