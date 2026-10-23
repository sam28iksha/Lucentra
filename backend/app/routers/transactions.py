"""Transactions router."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import AsyncSessionLocal, get_db
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


async def _run_sync_task() -> None:
    """Async background task to sync transactions without blocking the request."""
    async with AsyncSessionLocal() as session:
        service = TransactionService(session)
        await service.sync_recent_history(days=90)


@router.get("")
async def list_transactions(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return paginated normalized transactions from DB."""
    service = TransactionService(db)
    return await service.list_transactions(limit=limit, offset=offset, status=status)


@router.post("/sync")
async def sync_transactions(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    """Trigger background PayPal transaction ingestion job."""
    background_tasks.add_task(_run_sync_task)
    return {"status": "sync queued"}
