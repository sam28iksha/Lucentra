"""Audit trail router."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("")
async def list_events(db: AsyncSession = Depends(get_db)) -> dict:
    # TODO T5.1
    return {"events": [], "total": 0}


@router.get("/verify")
async def verify_chain(db: AsyncSession = Depends(get_db)) -> dict:
    """Recompute the full hash chain and report whether it is intact.

    Returns {valid: bool, broken_at: uuid | null, checked: int}
    """
    # TODO T5.1
    return {"valid": True, "broken_at": None, "checked": 0}
