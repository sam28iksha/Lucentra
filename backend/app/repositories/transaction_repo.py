"""Repository for persisting and querying normalized PayPal transactions."""

from __future__ import annotations

import logging
from collections.abc import Sequence
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.transaction import Transaction

logger = logging.getLogger("lucentra.repo.transaction")


class TransactionRepository:
    """Async database repository for Transaction entities."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, txn_id: UUID) -> Transaction | None:
        """Fetch a single transaction by internal primary key."""
        stmt = select(Transaction).where(Transaction.id == txn_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_paypal_id(self, paypal_txn_id: str) -> Sequence[Transaction]:
        """Fetch all records matching a given PayPal transaction ID."""
        stmt = (
            select(Transaction)
            .where(Transaction.paypal_transaction_id == paypal_txn_id)
            .order_by(Transaction.transaction_initiation_date.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_transactions(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
        status: str | None = None,
    ) -> tuple[Sequence[Transaction], int]:
        """List transactions paginated, with optional status filter."""
        stmt = select(Transaction)
        count_stmt = select(func.count(Transaction.id))

        if status:
            stmt = stmt.where(Transaction.transaction_status == status)
            count_stmt = count_stmt.where(Transaction.transaction_status == status)

        stmt = stmt.order_by(desc(Transaction.transaction_initiation_date)).limit(limit).offset(offset)

        items_res = await self.session.execute(stmt)
        count_res = await self.session.execute(count_stmt)

        return items_res.scalars().all(), count_res.scalar() or 0

    async def upsert(
        self,
        *,
        paypal_transaction_id: str,
        transaction_event_code: str,
        transaction_initiation_date: datetime,
        transaction_updated_date: datetime | None,
        transaction_amount_minor: int | None,
        fee_amount_minor: int | None,
        transaction_currency: str | None,
        transaction_status: str | None,
        transaction_subject: str | None,
        payer_email: str | None,
        payer_name: str | None,
        raw_payload: dict[str, Any],
        sync_job_id: str | None = None,
    ) -> Transaction:
        """Upsert a transaction row based on the composite unique key.

        Idempotent: updates non-key fields if identical composite key exists.
        """
        stmt = (
            insert(Transaction)
            .values(
                paypal_transaction_id=paypal_transaction_id,
                transaction_event_code=transaction_event_code,
                transaction_initiation_date=transaction_initiation_date,
                transaction_updated_date=transaction_updated_date,
                transaction_amount_minor=transaction_amount_minor,
                fee_amount_minor=fee_amount_minor,
                transaction_currency=transaction_currency,
                transaction_status=transaction_status,
                transaction_subject=transaction_subject,
                payer_email=payer_email,
                payer_name=payer_name,
                raw_payload=raw_payload,
                sync_job_id=sync_job_id,
            )
            .on_conflict_do_update(
                constraint="uq_transaction_composite",
                set_={
                    "transaction_updated_date": transaction_updated_date,
                    "transaction_amount_minor": transaction_amount_minor,
                    "fee_amount_minor": fee_amount_minor,
                    "transaction_status": transaction_status,
                    "raw_payload": raw_payload,
                },
            )
            .returning(Transaction)
        )

        res = await self.session.execute(stmt)
        return res.scalar_one()
