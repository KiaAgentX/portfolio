#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "packages", "core"))

from sqlalchemy import select

from hermesdesk.db.models import Base, Product
from hermesdesk.db.seed import seed_catalog
from hermesdesk.db.session import init_engine, session_scope


async def main():
    engine = init_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with session_scope() as session:
        has = await session.scalar(select(Product).limit(1))
        if has:
            print("catalog already seeded")
            return
        n = await seed_catalog(session)
        print("seeded", n, "products")


if __name__ == "__main__":
    asyncio.run(main())
