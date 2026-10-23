"""Sandbox-only tools for creating test scenarios.

IMPORTANT: These endpoints are ONLY available when SANDBOX_MODE=true.
They are gated in main.py and include X-Sandbox-Only response headers.
They create artificial dispute scenarios for demo purposes.
All responses are clearly labeled as sandbox/demo data.
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/sandbox",
    tags=["sandbox"],
)

_SANDBOX_HEADER = {"X-Sandbox-Only": "true", "X-Demo-Data": "true"}


@router.post("/create-dispute")
async def create_dispute() -> JSONResponse:
    """Create a sandbox dispute against a transaction (sandbox only)."""
    # TODO T6.3: call PayPal sandbox dispute creation endpoint
    return JSONResponse(
        {"status": "stub", "note": "SANDBOX ONLY — not available in production"},
        headers=_SANDBOX_HEADER,
    )


@router.post("/require-evidence/{dispute_id}")
async def require_evidence(dispute_id: str) -> JSONResponse:
    """Move a sandbox dispute to WAITING_FOR_SELLER_RESPONSE (sandbox only)."""
    # TODO T6.3
    return JSONResponse(
        {"status": "stub", "dispute_id": dispute_id, "note": "SANDBOX ONLY"},
        headers=_SANDBOX_HEADER,
    )


@router.post("/adjudicate/{dispute_id}")
async def adjudicate(dispute_id: str) -> JSONResponse:
    """Adjudicate a sandbox dispute (sandbox only)."""
    # TODO T6.3
    return JSONResponse(
        {"status": "stub", "dispute_id": dispute_id, "note": "SANDBOX ONLY"},
        headers=_SANDBOX_HEADER,
    )
