from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import jwt

from hermesdesk.config import get_settings


def create_token(admin_id: str, role: str) -> str:
    s = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": admin_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=s.jwt_hours)).timestamp()),
    }
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_algorithm)


def decode_token(token: str) -> dict:
    s = get_settings()
    return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
