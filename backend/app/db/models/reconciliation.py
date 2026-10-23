"""ORM model for reconciliation results."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ReconResult(Base):
    """Result of matching a PayPal transaction against an internal order/invoice."""

    __tablename__ = "recon_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── References ────────────────────────────────────────────────────────────
    paypal_transaction_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    transaction_event_code: Mapped[str] = mapped_column(String(16), nullable=False)
    transaction_initiation_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    internal_order_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    internal_invoice_id: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # ── Match result ──────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    # matched | partially_matched | unmatched | amount_mismatch |
    # currency_mismatch | duplicate_candidate | missing_order |
    # pending_external | needs_manual_review

    match_rule: Mapped[str | None] = mapped_column(String(64), nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Amounts (minor units) ─────────────────────────────────────────────────
    paypal_amount_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    paypal_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    order_amount_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    order_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)

    # ── Manual correction ─────────────────────────────────────────────────────
    manually_corrected: Mapped[bool] = mapped_column(default=False)
    correction_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrected_by: Mapped[str | None] = mapped_column(String(128), nullable=True)
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Run metadata ──────────────────────────────────────────────────────────
    run_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    # Prevents duplicate results from multiple runs
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # ── Raw snapshot for audit ────────────────────────────────────────────────
    snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
