"""FastAPI application factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ai, audit, auth, disputes, reconciliation, transactions, webhooks

if settings.sandbox_mode:
    from app.routers import sandbox as sandbox_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle hooks."""
    # Future: trigger initial transaction sync job here
    yield


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    app = FastAPI(
        title="Lucentra API",
        description=(
            "AI-powered PayPal dispute, reconciliation and revenue-protection platform. "
            "Running against PayPal Sandbox — no real money involved."
        ),
        version="0.1.0",
        docs_url="/api/docs" if not settings.is_production else None,
        redoc_url=None,
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    api_prefix = "/api"
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(transactions.router, prefix=api_prefix)
    app.include_router(disputes.router, prefix=api_prefix)
    app.include_router(reconciliation.router, prefix=api_prefix)
    app.include_router(audit.router, prefix=api_prefix)
    app.include_router(ai.router, prefix=api_prefix)
    app.include_router(webhooks.router)  # /webhooks — no /api prefix

    if settings.sandbox_mode:
        app.include_router(sandbox_router.router, prefix=api_prefix)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    return app


app = create_app()
