from __future__ import annotations

from hermesdesk.channels.email import EmailAdapter
from hermesdesk.channels.telegram import TelegramAdapter
from hermesdesk.channels.whatsapp_meta import WhatsAppMetaAdapter
from hermesdesk.channels.whatsapp_twilio import WhatsAppTwilioAdapter
from hermesdesk.config import get_settings


def get_adapter(channel: str):
    s = get_settings()
    if channel == "telegram":
        return TelegramAdapter()
    if channel == "whatsapp":
        if s.whatsapp_provider == "twilio":
            return WhatsAppTwilioAdapter()
        return WhatsAppMetaAdapter()
    if channel == "email":
        return EmailAdapter()
    raise ValueError(f"unknown channel {channel}")
