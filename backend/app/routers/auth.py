"""Auth router — login, token, me."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def me() -> dict[str, str]:
    # TODO T1: implement JWT auth
    return {"status": "stub — auth not yet implemented"}
