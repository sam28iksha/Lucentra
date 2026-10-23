"""Pydantic schemas and enums for the pure domain reconciliation engine.

Zero database or network dependencies.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class ReconMatchState(StrEnum):
    """Possible outcomes of reconciliation."""

    MATCHED = "matched"
    PARTIALLY_MATCHED = "partially_matched"
    UNMATCHED = "unmatched"
    AMOUNT_MISMATCH = "amount_mismatch"
    CURRENCY_MISMATCH = "currency_mismatch"
    DUPLICATE_CANDIDATE = "duplicate_candidate"
    MISSING_ORDER = "missing_order"
    PENDING_EXTERNAL = "pending_external"
    NEEDS_MANUAL_REVIEW = "needs_manual_review"


class ReconMatchRule(StrEnum):
    """Deterministic rule applied to resolve match state."""

    EXACT_PAYPAL_REF = "EXACT_PAYPAL_REF"
    INVOICE_REF_EXACT = "INVOICE_REF_EXACT"
    ORDER_REF_EXACT = "ORDER_REF_EXACT"
    PARTIAL_REFUND_MATCH = "PARTIAL_REFUND_MATCH"
    MULTIPLE_REFUNDS_MATCH = "MULTIPLE_REFUNDS_MATCH"
    REVERSED_TXN_MATCH = "REVERSED_TXN_MATCH"
    AMOUNT_CURRENCY_HEURISTIC = "AMOUNT_CURRENCY_HEURISTIC"
    PENDING_PAYMENT_RULE = "PENDING_PAYMENT_RULE"
    DUPLICATE_DETECTED = "DUPLICATE_DETECTED"
    UNLINKED_PAYMENT = "UNLINKED_PAYMENT"
    MISSING_PAYMENT = "MISSING_PAYMENT"
    MANUAL_CORRECTION = "MANUAL_CORRECTION"


class LedgerTransaction(BaseModel):
    """Normalized transaction input for reconciliation engine."""

    id: str
    paypal_transaction_id: str
    transaction_event_code: str  # T0006=checkout, T1107=refund, etc.
    transaction_initiation_date: datetime
    amount_minor: int  # Gross amount in minor units
    fee_minor: int = 0
    currency: str
    status: str = "S"  # S=Success, P=Pending, V=Reversed
    invoice_id: str | None = None
    custom_field: str | None = None
    parent_transaction_id: str | None = None


class MerchantOrder(BaseModel):
    """Internal merchant order/invoice to reconcile against."""

    order_id: str
    invoice_id: str | None = None
    amount_minor: int
    currency: str
    created_at: datetime
    paypal_reference_id: str | None = None
    customer_email: str | None = None


class ReconMatch(BaseModel):
    """Outcome of reconciling a transaction against an order."""

    transaction_id: str | None = None
    order_id: str | None = None
    match_state: ReconMatchState
    match_rule: ReconMatchRule
    discrepancy_amount_minor: int = 0
    currency: str
    explanation: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    manual_override: bool = False
    override_reason: str | None = None
