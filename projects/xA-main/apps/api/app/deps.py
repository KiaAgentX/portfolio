from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.config import Settings, get_settings
from hermesdesk.db.models import Admin
from hermesdesk.db.repos import get_admin
from hermesdesk.db.session import get_session

from app.auth.jwt import decode_token


async def db_session() -> AsyncSession:
    async for s in get_session():
        yield s


def settings() -> Settings:
    return get_settings()


async def current_admin(
    authorization: Annotated[str | None, Header()] = None,
    x_telegram_init: Annotated[str | None, Header(alias="X-Telegram-Init-Data")] = None,
    session: AsyncSession = Depends(db_session),
) -> Admin:
    from app.auth.telegram import admin_from_init_data

    if x_telegram_init:
        admin = await admin_from_init_data(session, x_telegram_init)
        if admin:
            return admin
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "unauthorized")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        admin_id = uuid.UUID(payload["sub"])
    except Exception as exc:
        raise HTTPException(401, "invalid token") from exc
    admin = await get_admin(session, admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(401, "unauthorized")
    return admin


async def approver_admin(admin: Admin = Depends(current_admin)) -> Admin:
    if admin.role not in {"owner", "approver"}:
        raise HTTPException(403, "forbidden")
    return admin
