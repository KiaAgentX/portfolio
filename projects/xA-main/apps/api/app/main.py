from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from hermesdesk.config import get_settings
from hermesdesk.db.models import Admin, Base, Product
from hermesdesk.db.session import get_factory, init_engine, session_scope
from hermesdesk.security.secrets import hash_password

from app.errors import register_errors
from app.logging import setup_logging
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.routers import (
    admin_metrics,
    approvals,
    auth,
    health,
    sse,
    tickets,
    webhooks_email,
    webhooks_telegram,
    webhooks_whatsapp,
)


async def _bootstrap() -> None:
    settings = get_settings()
    engine = init_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with session_scope() as session:
        existing = await session.scalar(select(Admin).limit(1))
        if not existing:
            session.add(
                Admin(
                    email=settings.admin_bootstrap_email,
                    password_hash=hash_password(settings.admin_bootstrap_password),
                    name="المشرف",
                    role="owner",
                )
            )
        has_products = await session.scalar(select(Product).limit(1))
        if not has_products:
            from hermesdesk.db.seed import seed_catalog

            await seed_catalog(session)


@asynccontextmanager
async def lifespan(_: FastAPI):
    setup_logging()
    await _bootstrap()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Hermes Desk", version="1.0.0", lifespan=lifespan)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_errors(app)
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(webhooks_telegram.router)
    app.include_router(webhooks_whatsapp.router)
    app.include_router(webhooks_email.router)
    app.include_router(approvals.router)
    app.include_router(tickets.router)
    app.include_router(admin_metrics.router)
    app.include_router(sse.router)

    static_dir = Path(__file__).parent / "static"
    static_dir.mkdir(exist_ok=True)
    index = static_dir / "index.html"
    if not index.exists():
        index.write_text(
            "<!doctype html><meta charset=utf-8><title>Hermes Desk</title>"
            "<p dir=rtl>لوحة التحكم تُبنى من apps/admin. شغّل npm run build.</p>",
            encoding="utf-8",
        )
    app.mount("/admin", StaticFiles(directory=static_dir, html=True), name="admin")
    return app


app = create_app()
