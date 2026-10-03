from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.db.repos import get_admin_by_email, get_admin_by_telegram
from hermesdesk.security.secrets import verify_password

from app.auth.jwt import create_token
from app.auth.telegram import verify_login_widget
from app.deps import current_admin, db_session
from app.schemas.common import LoginIn, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn, session: AsyncSession = Depends(db_session)):
    admin = await get_admin_by_email(session, body.email)
    if not admin or not admin.password_hash or not verify_password(body.password, admin.password_hash):
        raise HTTPException(401, "invalid credentials")
    if not admin.is_active:
        raise HTTPException(403, "disabled")
    token = create_token(str(admin.id), admin.role)
    return TokenOut(access_token=token, name=admin.name, role=admin.role)


@router.post("/telegram", response_model=TokenOut)
async def telegram_login(payload: dict, session: AsyncSession = Depends(db_session)):
    if not verify_login_widget(payload):
        raise HTTPException(401, "invalid telegram login")
    admin = await get_admin_by_telegram(session, int(payload["id"]))
    if not admin or not admin.is_active:
        raise HTTPException(403, "not an admin")
    token = create_token(str(admin.id), admin.role)
    return TokenOut(access_token=token, name=admin.name, role=admin.role)


@router.get("/me")
async def me(admin=Depends(current_admin)):
    return {"id": str(admin.id), "name": admin.name, "role": admin.role, "email": admin.email}
