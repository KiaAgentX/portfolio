from __future__ import annotations

import secrets
import time


def new_public_id() -> str:
    n = (int(time.time()) % 900000) + secrets.randbelow(1000)
    return f"TCK-{n:06d}"


def new_token(nbytes: int = 16) -> str:
    return secrets.token_urlsafe(nbytes)
