from __future__ import annotations

import httpx

from hermesdesk.config import get_settings


class EmailAdapter:
    name = "email"

    async def send_text(self, to: str, text: str, *, reply_to: str | None = None) -> str:
        s = get_settings()
        if s.email_provider == "sendgrid" and s.sendgrid_api_key:
            payload = {
                "personalizations": [{"to": [{"email": to}]}],
                "from": {"email": s.email_from},
                "subject": "رد مكتب هرمس",
                "content": [{"type": "text/plain", "value": text}],
            }
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    json=payload,
                    headers={"Authorization": f"Bearer {s.sendgrid_api_key}"},
                )
                r.raise_for_status()
                return r.headers.get("X-Message-Id", "sendgrid")
        if not s.resend_api_key:
            return "dry-run"
        payload = {
            "from": s.email_from,
            "to": [to],
            "subject": "رد مكتب هرمس",
            "text": text,
        }
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers={"Authorization": f"Bearer {s.resend_api_key}"},
            )
            r.raise_for_status()
            return r.json().get("id", "")

    async def send_document(self, to: str, r2_key: str, filename: str) -> str:
        return await self.send_text(to, f"مرفق: {filename}")

    async def ack_received(self, to: str, ticket_id: str) -> None:
        await self.send_text(to, f"تم استلام رسالتكم. رقم المتابعة {ticket_id}.")
