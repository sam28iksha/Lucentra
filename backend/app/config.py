"""Application settings loaded from environment variables.

All secrets (keys, tokens, passwords) are read here and NEVER forwarded to
the frontend, logs, or error responses.
"""

from __future__ import annotations

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised configuration — validated at startup via Pydantic."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── PayPal ──────────────────────────────────────────────────────────────
    paypal_client_id: str
    paypal_client_secret: str
    paypal_base_url: AnyHttpUrl = AnyHttpUrl("https://api-m.sandbox.paypal.com")
    paypal_webhook_id: str = ""  # required for webhook verification

    # ── Database ─────────────────────────────────────────────────────────────
    database_url: str  # asyncpg DSN

    # ── AI ───────────────────────────────────────────────────────────────────
    ai_provider: str = "anthropic"
    ai_model: str = "claude-3-5-sonnet-20241022"
    ai_api_key: str = ""

    # ── AG Studio ────────────────────────────────────────────────────────────
    ag_studio_license_key: str = ""

    # ── Auth ──────────────────────────────────────────────────────────────────
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # ── App ───────────────────────────────────────────────────────────────────
    environment: str = "development"
    cors_origins: str | list[str] = ["http://localhost:5173"]
    log_level: str = "INFO"
    sandbox_mode: bool = True

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Allow comma-separated string or real list."""
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    @property
    def paypal_base_url_str(self) -> str:
        return str(self.paypal_base_url).rstrip("/")

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


# Single shared instance — import this, don't re-instantiate
settings = Settings()  # type: ignore[call-arg]
