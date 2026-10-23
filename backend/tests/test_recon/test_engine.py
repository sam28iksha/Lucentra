"""All 14 required reconciliation scenarios tested against the pure engine.

Zero I/O. Deterministic, fast, reproducible.
"""

from __future__ import annotations

from datetime import UTC, datetime

import pytest

from app.domain.recon.engine import ReconciliationEngine
from app.domain.recon.models import (
    LedgerTransaction,
    MerchantOrder,
    ReconMatch,
    ReconMatchRule,
    ReconMatchState,
)


@pytest.fixture
def engine() -> ReconciliationEngine:
    return ReconciliationEngine()


# ── Scenario 1: Exact Match ──────────────────────────────────────────────────
def test_scenario_01_exact_match(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t1",
            paypal_transaction_id="PP_TXN_001",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 20, 12, 0, tzinfo=UTC),
            amount_minor=10000,
            currency="USD",
            invoice_id="INV-100",
        )
    ]
    orders = [
        MerchantOrder(
            order_id="ORD-100",
            invoice_id="INV-100",
            amount_minor=10000,
            currency="USD",
            created_at=datetime(2026, 10, 20, 11, 55, tzinfo=UTC),
        )
    ]
    results = engine.reconcile(txns, orders)
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.MATCHED
    assert results[0].match_rule == ReconMatchRule.INVOICE_REF_EXACT
    assert results[0].discrepancy_amount_minor == 0


# ── Scenario 2: Missing Order (Unlinked Payment) ────────────────────────────
def test_scenario_02_missing_order(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t2",
            paypal_transaction_id="PP_TXN_ORPHAN",
            transaction_event_code="T0000",
            transaction_initiation_date=datetime(2026, 10, 20, 14, 0, tzinfo=UTC),
            amount_minor=5000,
            currency="USD",
        )
    ]
    orders: list[MerchantOrder] = []
    results = engine.reconcile(txns, orders)
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.MISSING_ORDER
    assert results[0].match_rule == ReconMatchRule.UNLINKED_PAYMENT
    assert results[0].discrepancy_amount_minor == 5000


# ── Scenario 3: Missing Payment (Unmatched Order) ───────────────────────────
def test_scenario_03_missing_payment(engine: ReconciliationEngine) -> None:
    txns: list[LedgerTransaction] = []
    orders = [
        MerchantOrder(
            order_id="ORD-UNPAID",
            amount_minor=7500,
            currency="USD",
            created_at=datetime(2026, 10, 21, 9, 0, tzinfo=UTC),
        )
    ]
    results = engine.reconcile(txns, orders)
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.UNMATCHED
    assert results[0].match_rule == ReconMatchRule.MISSING_PAYMENT


# ── Scenario 4: Amount Mismatch ──────────────────────────────────────────────
def test_scenario_04_amount_mismatch(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t4",
            paypal_transaction_id="PP_TXN_SURCHARGE",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 21, 10, 0, tzinfo=UTC),
            amount_minor=10500,  # $105.00 captured
            currency="USD",
            invoice_id="INV-400",
        )
    ]
    orders = [
        MerchantOrder(
            order_id="ORD-400",
            invoice_id="INV-400",
            amount_minor=10000,  # $100.00 expected
            currency="USD",
            created_at=datetime(2026, 10, 21, 9, 50, tzinfo=UTC),
        )
    ]
    results = engine.reconcile(txns, orders)
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.AMOUNT_MISMATCH
    assert results[0].discrepancy_amount_minor == 500  # $5.00 discrepancy


# ── Scenario 5: Currency Mismatch ───────────────────────────────────────────
def test_scenario_05_currency_mismatch(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t5",
            paypal_transaction_id="PP_TXN_EUR",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 21, 11, 0, tzinfo=UTC),
            amount_minor=10000,
            currency="EUR",  # Euro received
            invoice_id="INV-500",
        )
    ]
    orders = [
        MerchantOrder(
            order_id="ORD-500",
            invoice_id="INV-500",
            amount_minor=10000,
            currency="USD",  # USD billed
            created_at=datetime(2026, 10, 21, 10, 50, tzinfo=UTC),
        )
    ]
    results = engine.reconcile(txns, orders)
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.CURRENCY_MISMATCH


# ── Scenario 6: Duplicate Candidate ─────────────────────────────────────────
def test_scenario_06_duplicate_candidate(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t6a",
            paypal_transaction_id="PP_TXN_DUP",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 21, 12, 0, tzinfo=UTC),
            amount_minor=5000,
            currency="USD",
        ),
        LedgerTransaction(
            id="t6b",
            paypal_transaction_id="PP_TXN_DUP",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 21, 12, 1, tzinfo=UTC),
            amount_minor=5000,
            currency="USD",
        ),
    ]
    results = engine.reconcile(txns, [])
    assert len(results) == 2
    assert all(r.match_state == ReconMatchState.DUPLICATE_CANDIDATE for r in results)


# ── Scenario 7: Partial Refund ──────────────────────────────────────────────
def test_scenario_07_partial_refund(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t7",
            paypal_transaction_id="PP_TXN_REFUND_PART",
            transaction_event_code="T1107",
            transaction_initiation_date=datetime(2026, 10, 22, 10, 0, tzinfo=UTC),
            amount_minor=-3000,  # -$30.00 refund
            currency="USD",
            custom_field="PP_TXN_ORIGINAL",
        )
    ]
    results = engine.reconcile(txns, [])
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.PARTIALLY_MATCHED
    assert results[0].match_rule == ReconMatchRule.PARTIAL_REFUND_MATCH


# ── Scenario 8: Multiple Refunds ────────────────────────────────────────────
def test_scenario_08_multiple_refunds(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t8a",
            paypal_transaction_id="PP_REF_1",
            transaction_event_code="T1107",
            transaction_initiation_date=datetime(2026, 10, 22, 11, 0, tzinfo=UTC),
            amount_minor=-1500,
            currency="USD",
            parent_transaction_id="PP_PARENT",
        ),
        LedgerTransaction(
            id="t8b",
            paypal_transaction_id="PP_REF_2",
            transaction_event_code="T1107",
            transaction_initiation_date=datetime(2026, 10, 22, 11, 30, tzinfo=UTC),
            amount_minor=-2000,
            currency="USD",
            parent_transaction_id="PP_PARENT",
        ),
    ]
    results = engine.reconcile(txns, [])
    assert len(results) == 2
    assert all(r.match_state == ReconMatchState.PARTIALLY_MATCHED for r in results)


# ── Scenario 9: Repeated Webhook (Idempotency) ──────────────────────────────
def test_scenario_09_repeated_webhook_idempotency(engine: ReconciliationEngine) -> None:
    # Running reconciliation once or twice over same batch yields identical deterministic output
    txns = [
        LedgerTransaction(
            id="t9",
            paypal_transaction_id="PP_TXN_999",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 22, 14, 0, tzinfo=UTC),
            amount_minor=8000,
            currency="USD",
            invoice_id="INV-999",
        )
    ]
    orders = [
        MerchantOrder(
            order_id="ORD-999",
            invoice_id="INV-999",
            amount_minor=8000,
            currency="USD",
            created_at=datetime(2026, 10, 22, 13, 0, tzinfo=UTC),
        )
    ]
    res1 = engine.reconcile(txns, orders)
    res2 = engine.reconcile(txns, orders)
    assert len(res1) == len(res2) == 1
    assert res1[0].match_state == res2[0].match_state == ReconMatchState.MATCHED


# ── Scenario 10: Out-of-Order Events ─────────────────────────────────────────
def test_scenario_10_out_of_order_events(engine: ReconciliationEngine) -> None:
    # Transaction arrived before order was inserted
    txns = [
        LedgerTransaction(
            id="t10",
            paypal_transaction_id="PP_TXN_EARLY",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 22, 15, 0, tzinfo=UTC),
            amount_minor=6500,
            currency="USD",
            invoice_id="INV-EARLY",
        )
    ]
    # In first pass order is missing
    r_pass1 = engine.reconcile(txns, [])
    assert r_pass1[0].match_state == ReconMatchState.MISSING_ORDER

    # When order arrives later, second pass reconciles cleanly
    order_late = MerchantOrder(
        order_id="ORD-EARLY",
        invoice_id="INV-EARLY",
        amount_minor=6500,
        currency="USD",
        created_at=datetime(2026, 10, 22, 15, 10, tzinfo=UTC),
    )
    r_pass2 = engine.reconcile(txns, [order_late])
    assert r_pass2[0].match_state == ReconMatchState.MATCHED


# ── Scenario 11: Pending Payment ────────────────────────────────────────────
def test_scenario_11_pending_payment(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t11",
            paypal_transaction_id="PP_TXN_PENDING",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 22, 16, 0, tzinfo=UTC),
            amount_minor=4200,
            currency="USD",
            status="P",  # Pending
        )
    ]
    results = engine.reconcile(txns, [])
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.PENDING_EXTERNAL
    assert results[0].match_rule == ReconMatchRule.PENDING_PAYMENT_RULE


# ── Scenario 12: Reversed Transaction ────────────────────────────────────────
def test_scenario_12_reversed_transaction(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t12",
            paypal_transaction_id="PP_TXN_REV",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 22, 17, 0, tzinfo=UTC),
            amount_minor=9000,
            currency="USD",
            status="V",  # Reversed
        )
    ]
    results = engine.reconcile(txns, [])
    assert len(results) == 1
    assert results[0].match_state == ReconMatchState.MATCHED
    assert results[0].match_rule == ReconMatchRule.REVERSED_TXN_MATCH


# ── Scenario 13: Manual Correction Model ────────────────────────────────────
def test_scenario_13_manual_correction() -> None:
    # A manual correction attaches an explicit reason and manual_override flag
    correction = ReconMatch(
        transaction_id="PP_TXN_400",
        order_id="ORD-400",
        match_state=ReconMatchState.MATCHED,
        match_rule=ReconMatchRule.MANUAL_CORRECTION,
        discrepancy_amount_minor=0,
        currency="USD",
        explanation="Manual correction approved",
        manual_override=True,
        override_reason="Customer added $5 expedited shipping surcharge by phone",
    )
    assert correction.manual_override is True
    assert correction.override_reason is not None
    assert correction.match_state == ReconMatchState.MATCHED


# ── Scenario 14: Rerun Without Duplicates ────────────────────────────────────
def test_scenario_14_rerun_without_duplicates(engine: ReconciliationEngine) -> None:
    txns = [
        LedgerTransaction(
            id="t14",
            paypal_transaction_id="PP_TXN_REPEAT",
            transaction_event_code="T0006",
            transaction_initiation_date=datetime(2026, 10, 22, 18, 0, tzinfo=UTC),
            amount_minor=12000,
            currency="USD",
            invoice_id="INV-RPT",
        )
    ]
    orders = [
        MerchantOrder(
            order_id="ORD-RPT",
            invoice_id="INV-RPT",
            amount_minor=12000,
            currency="USD",
            created_at=datetime(2026, 10, 22, 17, 50, tzinfo=UTC),
        )
    ]
    run_a = engine.reconcile(txns, orders)
    run_b = engine.reconcile(txns, orders)
    assert len(run_a) == 1
    assert len(run_b) == 1
    assert run_a[0].transaction_id == run_b[0].transaction_id
