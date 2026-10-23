"""ORM model for PayPal disputes."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Dispute(Base):
    """PayPal customer dispute with full state history."""

    __tablename__ = "disputes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    paypal_dispute_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)

    # ── Status / state ───────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    # OPEN | WAITING_FOR_SELLER_RESPONSE | UNDER_REVIEW | RESOLVED | OTHER
    reason: Mapped[str | None] = mapped_column(String(128), nullable=True)
    dispute_channel: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # ── Financials (minor units) ─────────────────────────────────────────────
    dispute_amount_minor: Mapped[int | None] = mapped_column(nullable=True)
    dispute_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)

    # ── Deadlines ────────────────────────────────────────────────────────────
    # Stored ONLY when returned by the PayPal API. Never invented.
    seller_response_due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Evidence flags ───────────────────────────────────────────────────────
    evidence_requested: Mapped[bool] = mapped_column(default=False)

    # ── Linked transaction ───────────────────────────────────────────────────
    paypal_transaction_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)

    # ── Raw payload ─────────────────────────────────────────────────────────
    raw_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # ── Evidence drafts (versioned, stored in JSONB array) ───────────────────
    # Each draft: {version, generated_at, draft: EvidenceDraft, approved: bool}
    evidence_drafts: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    # ── Timestamps ───────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
