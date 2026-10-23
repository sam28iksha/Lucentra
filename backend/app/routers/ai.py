"""AI router — evidence builder + Ask Lucentra chat."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/disputes/{dispute_id}/build-evidence")
async def build_evidence(
    dispute_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # TODO T7.1 — generate AI evidence draft; never auto-submits
    return {"status": "stub"}


@router.post("/ask")
async def ask_lucentra(
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # TODO T8.3 — natural language query over merchant data
    return {"status": "stub"}
