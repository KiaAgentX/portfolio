from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from hermesdesk.agents.tools.metrics import tool_query_metrics

from app.deps import current_admin, db_session

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("")
async def metrics(session: AsyncSession = Depends(db_session), _=Depends(current_admin)):
    return await tool_query_metrics(session)
