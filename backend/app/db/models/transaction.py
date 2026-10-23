"""ORM models for PayPal transactions.

Raw PayPal payloads stored as JSONB; normalized fields extracted
for querying. Composite key prevents duplicate ingestion.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Transaction(Base):
    """Normalized PayPal transaction with raw payload preservation."""

    __tablename__ = "transactions"
    __table_args__ = (
        # Composite key because transaction_id alone is NOT unique
        # in the PayPal reporting system (same ID can appear with
        # different event codes or timestamps).
        UniqueConstraint(
            "paypal_transaction_id",
            "transaction_event_code",
            "transaction_initiation_date",
            name="uq_transaction_composite",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # ── PayPal composite key fields ─────────────────────────────────────────
    paypal_transaction_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    transaction_event_code: Mapped[str] = mapped_column(String(16), nullable=False)
    transaction_initiation_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # ── Normalized fields ────────────────────────────────────────────────────
    transaction_updated_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Amounts stored as integer minor units (e.g. cents for USD)
    transaction_amount_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fee_amount_minor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    transaction_currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    transaction_status: Mapped[str | None] = mapped_column(String(1), nullable=True)
    # S=success, P=pending, D=denied, V=reversed, F=partially_refunded

    transaction_subject: Mapped[str | None] = mapped_column(Text, nullable=True)
    payer_email: Mapped[str | None] = mapped_column(String(256), nullable=True)
    payer_name: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # ── Raw payload ─────────────────────────────────────────────────────────
    raw_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # ── Ingestion metadata ──────────────────────────────────────────────────
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    sync_job_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
