from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from hermesdesk.config import get_settings

_engine = None
_factory: async_sessionmaker[AsyncSession] | None = None


def init_engine(url: str | None = None):
    global _engine, _factory
    settings = get_settings()
    _engine = create_async_engine(url or settings.database_url, pool_pre_ping=True)
    _factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


def get_factory() -> async_sessionmaker[AsyncSession]:
    if _factory is None:
        init_engine()
    assert _factory is not None
    return _factory


async def get_session() -> AsyncIterator[AsyncSession]:
    factory = get_factory()
    async with factory() as session:
        yield session


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    factory = get_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
