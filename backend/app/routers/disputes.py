"""Disputes router."""

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db

router = APIRouter(prefix="/disputes", tags=["disputes"])


@router.get("")
async def list_disputes(db: AsyncSession = Depends(get_db)) -> dict:
    # TODO T6.1
    return {"disputes": [], "total": 0}


@router.get("/{dispute_id}")
async def get_dispute(dispute_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    # TODO T6.1
    return {"dispute_id": dispute_id}


@router.post("/sync")
async def sync_disputes(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # TODO T6.1
    return {"status": "sync queued"}


@router.post("/{dispute_id}/submit-evidence")
async def submit_evidence(
    dispute_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # TODO T7.4 — human-approved only; guarded by explicit approval check
    return {"status": "stub — requires human approval flow"}
