from __future__ import annotations

import httpx

from hermesdesk.config import get_settings


class TelegramAdapter:
    name = "telegram"

    def __init__(self) -> None:
        self.token = get_settings().telegram_customer_bot_token

    def _url(self, method: str) -> str:
        return f"https://api.telegram.org/bot{self.token}/{method}"

    async def send_text(self, to: str, text: str, *, reply_to: str | None = None) -> str:
        if not self.token:
            return "dry-run"
        payload = {"chat_id": to, "text": text}
        if reply_to:
            payload["reply_to_message_id"] = int(reply_to)
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(self._url("sendMessage"), json=payload)
            r.raise_for_status()
            return str(r.json().get("result", {}).get("message_id", ""))

    async def send_document(self, to: str, r2_key: str, filename: str) -> str:
        return await self.send_text(to, f"مرفق: {filename}")

    async def ack_received(self, to: str, ticket_id: str) -> None:
        await self.send_text(to, f"تم استلام رسالتكم. رقم المتابعة {ticket_id}.")
