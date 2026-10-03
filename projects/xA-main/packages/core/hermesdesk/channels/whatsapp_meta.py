from __future__ import annotations

import httpx

from hermesdesk.config import get_settings


class WhatsAppMetaAdapter:
    name = "whatsapp"

    async def send_text(self, to: str, text: str, *, reply_to: str | None = None) -> str:
        s = get_settings()
        if not s.meta_waba_token or not s.meta_waba_phone_id:
            return "dry-run"
        url = f"https://graph.facebook.com/v21.0/{s.meta_waba_phone_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": text},
        }
        headers = {"Authorization": f"Bearer {s.meta_waba_token}"}
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(url, json=payload, headers=headers)
            r.raise_for_status()
            return r.json().get("messages", [{}])[0].get("id", "")

    async def send_document(self, to: str, r2_key: str, filename: str) -> str:
        return await self.send_text(to, f"مرفق: {filename}")

    async def ack_received(self, to: str, ticket_id: str) -> None:
        await self.send_text(to, f"تم استلام رسالتكم. رقم المتابعة {ticket_id}.")
