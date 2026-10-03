#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages", "core"))

from sqlalchemy import select

from hermesdesk.config import get_settings
from hermesdesk.db.models import Admin, Base
from hermesdesk.db.session import init_engine, session_scope
from hermesdesk.security.secrets import hash_password


async def main():
    settings = get_settings()
    engine = init_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    email = os.getenv("ADMIN_EMAIL", settings.admin_bootstrap_email)
    password = os.getenv("ADMIN_PASSWORD", settings.admin_bootstrap_password)
    name = os.getenv("ADMIN_NAME", "المشرف")
    async with session_scope() as session:
        existing = await session.scalar(select(Admin).where(Admin.email == email))
        if existing:
            print("admin exists", email)
            return
        session.add(Admin(email=email, password_hash=hash_password(password), name=name, role="owner"))
        print("created", email)


if __name__ == "__main__":
    asyncio.run(main())
