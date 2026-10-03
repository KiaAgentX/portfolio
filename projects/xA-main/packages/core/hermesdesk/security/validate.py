from __future__ import annotations

import re
from pathlib import Path

from hermesdesk.config import get_settings

_SAFE_NAME = re.compile(r"[^A-Za-z0-9._\-\u0600-\u06FF]+")

ALLOWED_MIME = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
}


def allowed_mime(mime: str) -> bool:
    return (mime or "").lower() in ALLOWED_MIME


def sanitize_filename(name: str) -> str:
    name = Path(name or "file").name
    name = _SAFE_NAME.sub("_", name).strip("._") or "file"
    return name[:180]


def validate_inbound_text(text: str) -> str:
    settings = get_settings()
    text = (text or "").strip()
    if len(text) > settings.max_inbound_chars:
        text = text[: settings.max_inbound_chars]
    return text
