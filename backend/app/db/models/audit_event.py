"""Append-only audit event model with hash chain.

The app DB role has INSERT privilege only on this table — enforced
by the migration. UPDATE and DELETE are denied at the DB level,
making the chain tamper-evident (not tamper-proof).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditEvent(Base):
    """Immutable audit record; hash chained for tamper evidence."""

    __tablename__ = "audit_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sequence: Mapped[int] = mapped_column(nullable=False, index=True)
    # Monotonically increasing; enforced by DB sequence

    # ── Who / when ────────────────────────────────────────────────────────────
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True
    )
    actor: Mapped[str] = mapped_column(String(128), nullable=False)
    # "system" | "user:<id>" | "paypal_webhook"

    # ── What ──────────────────────────────────────────────────────────────────
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    # e.g. "dispute.imported", "recon.corrected", "evidence.submitted"
    record_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    record_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    # ── Before / after ────────────────────────────────────────────────────────
    before_state: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    after_state: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # ── Context ───────────────────────────────────────────────────────────────
    source: Mapped[str | None] = mapped_column(String(64), nullable=True)
    external_reference: Mapped[str | None] = mapped_column(String(256), nullable=True)
    outcome: Mapped[str | None] = mapped_column(String(64), nullable=True)
    override_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)

    # ── Hash chain ────────────────────────────────────────────────────────────
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    # sha256 hex of the previous event's canonical JSON
    event_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    # sha256(prev_hash + canonical_json(this_event))
