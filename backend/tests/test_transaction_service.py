"""Tests for TransactionService normalization, money conversion, and sliding windows."""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock

import pytest

from app.services.transaction_service import TransactionService


@pytest.fixture
def mock_session() -> AsyncMock:
    session = AsyncMock()
    return session


@pytest.fixture
def sample_paypal_raw() -> dict[str, Any]:
    return {
        "transaction_info": {
            "transaction_id": "9XY82190KV829102X",
            "transaction_event_code": "T0006",
            "transaction_initiation_date": "2026-10-22T14:32:00Z",
            "transaction_updated_date": "2026-10-22T14:32:05Z",
            "transaction_amount": {
                "currency_code": "USD",
                "value": "450.00",
            },
            "fee_amount": {
                "currency_code": "USD",
                "value": "14.35",
            },
            "transaction_status": "S",
            "transaction_subject": "Order INV-2026-8801 payment",
        },
        "payer_info": {
            "email_address": "alex.t@example.com",
            "payer_name": {
                "alternate_full_name": "Alex Turner",
            },
        },
    }


def test_normalize_record_extracts_correct_fields(
    mock_session: AsyncMock,
    sample_paypal_raw: dict[str, Any],
) -> None:
    service = TransactionService(mock_session)
    norm = service._normalize_record(sample_paypal_raw, "test_job_123")

    assert norm is not None
    assert norm["paypal_transaction_id"] == "9XY82190KV829102X"
    assert norm["transaction_event_code"] == "T0006"
    assert norm["transaction_amount_minor"] == 45000  # $450.00 -> 45000 cents
    assert norm["fee_amount_minor"] == 1435  # $14.35 -> 1435 cents
    assert norm["transaction_currency"] == "USD"
    assert norm["transaction_status"] == "S"
    assert norm["payer_email"] == "alex.t@example.com"
    assert norm["payer_name"] == "Alex Turner"
    assert norm["sync_job_id"] == "test_job_123"


def test_normalize_record_handles_missing_fee(
    mock_session: AsyncMock,
    sample_paypal_raw: dict[str, Any],
) -> None:
    sample_paypal_raw["transaction_info"].pop("fee_amount", None)
    service = TransactionService(mock_session)
    norm = service._normalize_record(sample_paypal_raw, "test_job_123")

    assert norm is not None
    assert norm["fee_amount_minor"] is None


def test_normalize_record_skips_invalid_keys(mock_session: AsyncMock) -> None:
    service = TransactionService(mock_session)
    bad_payload = {"transaction_info": {"transaction_id": "ONLY_ID"}}
    assert service._normalize_record(bad_payload, "job") is None
