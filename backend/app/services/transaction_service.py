"""Transaction ingestion and query service.

Coordinates fetching from PayPal Transaction Search (with sliding 31-day windows),
normalizing raw payloads, and persisting into the append-only repository.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.money import to_minor
from app.repositories.transaction_repo import TransactionRepository
from app.services.paypal_client import PayPalClient, paypal_client

logger = logging.getLogger("lucentra.service.transaction")


class TransactionService:
    """Business logic for ingesting, querying, and normalizing PayPal transactions."""

    def __init__(
        self,
        session: AsyncSession,
        client: PayPalClient = paypal_client,
    ) -> None:
        self.session = session
        self.repo = TransactionRepository(session)
        self.client = client

    def _normalize_record(self, raw: dict[str, Any], sync_job_id: str) -> dict[str, Any] | None:
        """Extract normalized fields from PayPal raw transaction object."""
        txn_info = raw.get("transaction_info", {})
        payer_info = raw.get("payer_info", {})

        paypal_txn_id = txn_info.get("transaction_id")
        event_code = txn_info.get("transaction_event_code")
        initiation_str = txn_info.get("transaction_initiation_date")

        if not paypal_txn_id or not event_code or not initiation_str:
            logger.warning("Skipping malformed transaction without composite keys: %s", raw)
            return None

        initiation_date = datetime.fromisoformat(initiation_str.replace("Z", "+00:00"))

        updated_str = txn_info.get("transaction_updated_date")
        updated_date = datetime.fromisoformat(updated_str.replace("Z", "+00:00")) if updated_str else None

        # Monetary fields
        amount_obj = txn_info.get("transaction_amount", {})
        currency = amount_obj.get("currency_code", "USD")
        val_str = amount_obj.get("value", "0.00")
        try:
            amount_minor = to_minor(val_str, currency)
        except Exception:
            amount_minor = 0

        fee_obj = txn_info.get("fee_amount")
        fee_minor = None
        if fee_obj and "value" in fee_obj:
            try:
                fee_minor = to_minor(fee_obj["value"], fee_obj.get("currency_code", currency))
            except Exception:
                fee_minor = 0

        payer_email = payer_info.get("email_address")
        payer_name_obj = payer_info.get("payer_name", {})
        payer_name = (
            payer_name_obj.get("alternate_full_name")
            or f"{payer_name_obj.get('given_name', '')} {payer_name_obj.get('surname', '')}".strip()
            or None
        )

        return {
            "paypal_transaction_id": paypal_txn_id,
            "transaction_event_code": event_code,
            "transaction_initiation_date": initiation_date,
            "transaction_updated_date": updated_date,
            "transaction_amount_minor": amount_minor,
            "fee_amount_minor": fee_minor,
            "transaction_currency": currency,
            "transaction_status": txn_info.get("transaction_status"),
            "transaction_subject": txn_info.get("transaction_subject"),
            "payer_email": payer_email,
            "payer_name": payer_name,
            "raw_payload": raw,
            "sync_job_id": sync_job_id,
        }

    async def ingest_window(
        self,
        start_date: datetime,
        end_date: datetime,
        sync_job_id: str,
    ) -> int:
        """Fetch and ingest transactions for a window <= 31 days."""
        imported_count = 0
        page = 1
        page_size = 100

        while True:
            data = await self.client.get_transactions(
                start_date=start_date,
                end_date=end_date,
                page=page,
                page_size=page_size,
            )

            txns = data.get("transaction_details", [])
            if not txns:
                break

            for raw in txns:
                norm = self._normalize_record(raw, sync_job_id)
                if norm:
                    await self.repo.upsert(**norm)
                    imported_count += 1

            total_pages = data.get("total_pages", page)
            if page >= total_pages:
                break
            page += 1

        await self.session.commit()
        return imported_count

    async def sync_recent_history(self, days: int = 90) -> dict[str, Any]:
        """Ingest transactions across sliding 30-day windows back to `days` ago."""
        sync_job_id = f"job_sync_{uuid4().hex[:12]}"
        now = datetime.now(UTC)
        total_ingested = 0
        window_size = 30

        for offset in range(0, days, window_size):
            end_dt = now - timedelta(days=offset)
            start_dt = max(now - timedelta(days=offset + window_size), now - timedelta(days=days))

            try:
                count = await self.ingest_window(start_dt, end_dt, sync_job_id)
                total_ingested += count
                logger.info(
                    "Ingested %d txns between %s and %s",
                    count,
                    start_dt.date(),
                    end_dt.date(),
                )
            except Exception as exc:
                logger.error("Error ingesting window %s - %s: %s", start_dt, end_dt, exc)

        return {
            "sync_job_id": sync_job_id,
            "total_ingested": total_ingested,
            "synced_at": now.isoformat(),
        }

    async def list_transactions(
        self,
        limit: int = 100,
        offset: int = 0,
        status: str | None = None,
    ) -> dict[str, Any]:
        """Fetch list of transactions for UI."""
        items, total = await self.repo.list_transactions(limit=limit, offset=offset, status=status)
        return {
            "transactions": [
                {
                    "id": str(t.id),
                    "transaction_id": t.paypal_transaction_id,
                    "transaction_event_code": t.transaction_event_code,
                    "transaction_initiation_date": t.transaction_initiation_date.isoformat(),
                    "transaction_updated_date": t.transaction_updated_date.isoformat()
                    if t.transaction_updated_date
                    else None,
                    "gross_amount": t.transaction_amount_minor,
                    "fee_amount": t.fee_amount_minor or 0,
                    "net_amount": (t.transaction_amount_minor or 0) - (t.fee_amount_minor or 0),
                    "currency": t.transaction_currency or "USD",
                    "transaction_status": t.transaction_status,
                    "payer_email": t.payer_email,
                    "payer_name": t.payer_name,
                    "is_demo": False,
                }
                for t in items
            ],
            "total": total,
        }
