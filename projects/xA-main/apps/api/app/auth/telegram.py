from __future__ import annotations

import hashlib
import hmac
import json
from urllib.parse import parse_qs

from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import get_settings
from hermesdesk.db.repos import get_admin_by_telegram


def _check_init_data(init_data: str, bot_token: str) -> dict | None:
    if not init_data or not bot_token:
        return None
    parsed = {k: v[0] for k, v in parse_qs(init_data, keep_blank_values=True).items()}
    got = parsed.pop("hash", None)
    if not got:
        return None
    data_check = "\n".join(f"{k}={parsed[k]}" for k in sorted(parsed))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, got):
        return None
    user_raw = parsed.get("user")
    if not user_raw:
        return None
    return json.loads(user_raw)


async def admin_from_init_data(session: AsyncSession, init_data: str):
    s = get_settings()
    user = _check_init_data(init_data, s.telegram_admin_bot_token)
    if not user:
        return None
    return await get_admin_by_telegram(session, int(user["id"]))


def verify_login_widget(payload: dict) -> bool:
    s = get_settings()
    token = s.telegram_admin_bot_token
    if not token:
        return False
    check = {k: str(v) for k, v in payload.items() if k != "hash" and v is not None}
    data_check = "\n".join(f"{k}={check[k]}" for k in sorted(check))
    secret = hashlib.sha256(token.encode()).digest()
    calc = hmac.new(secret, data_check.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(calc, payload.get("hash", ""))
