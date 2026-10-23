"""Reconciliation router."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])


@router.post("/run")
async def run_reconciliation(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    # TODO T4.3
    return {"status": "stub"}


@router.get("/results")
async def list_results(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    # TODO T4.3
    return {"results": [], "total": 0}


@router.patch("/{result_id}/correct")
async def correct_result(
    result_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    # TODO T4.3 — requires owner/reviewer role + mandatory reason
    return {"status": "stub"}
