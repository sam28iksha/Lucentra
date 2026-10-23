"""Pure domain reconciliation engine.

Deterministic matching logic with zero network/database I/O.
Processes transactions and orders in strict hierarchical order:
1. Exact reference keys (PayPal transaction ID, invoice ID, order ID)
2. Currency validation
3. Amount verification & discrepancy tracking
4. Status and event code handling (refunds, reversals, pending payments)
5. Duplicate detection
"""

from __future__ import annotations

from collections.abc import Sequence

from app.domain.recon.models import (
    LedgerTransaction,
    MerchantOrder,
    ReconMatch,
    ReconMatchRule,
    ReconMatchState,
)


class ReconciliationEngine:
    """Pure domain reconciliation engine."""

    def reconcile(
        self,
        transactions: Sequence[LedgerTransaction],
        orders: Sequence[MerchantOrder],
    ) -> list[ReconMatch]:
        """Run deterministic matching over transactions and merchant orders."""
        matches: list[ReconMatch] = []
        matched_txn_ids: set[str] = set()
        matched_order_ids: set[str] = set()

        # Build lookup maps
        orders_by_paypal_ref = {o.paypal_reference_id: o for o in orders if o.paypal_reference_id}
        orders_by_invoice = {o.invoice_id: o for o in orders if o.invoice_id}
        orders_by_id = {o.order_id: o for o in orders}

        # Check for duplicates among transactions
        seen_composite: dict[str, int] = {}
        for txn in transactions:
            key = f"{txn.paypal_transaction_id}_{txn.amount_minor}"
            seen_composite[key] = seen_composite.get(key, 0) + 1

        # Process each transaction
        for txn in transactions:
            composite_key = f"{txn.paypal_transaction_id}_{txn.amount_minor}"
            is_duplicate = seen_composite[composite_key] > 1

            if is_duplicate:
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=None,
                        match_state=ReconMatchState.DUPLICATE_CANDIDATE,
                        match_rule=ReconMatchRule.DUPLICATE_DETECTED,
                        discrepancy_amount_minor=0,
                        currency=txn.currency,
                        explanation=f"Multiple ledger entries detected for transaction {txn.paypal_transaction_id} with identical amount.",
                    )
                )
                matched_txn_ids.add(txn.id)
                continue

            # Handle Pending Status
            if txn.status == "P":
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=None,
                        match_state=ReconMatchState.PENDING_EXTERNAL,
                        match_rule=ReconMatchRule.PENDING_PAYMENT_RULE,
                        discrepancy_amount_minor=txn.amount_minor,
                        currency=txn.currency,
                        explanation=f"Payment {txn.paypal_transaction_id} is in pending status (P) awaiting settlement.",
                    )
                )
                matched_txn_ids.add(txn.id)
                continue

            # Handle Reversal
            if txn.status == "V":
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=None,
                        match_state=ReconMatchState.MATCHED,
                        match_rule=ReconMatchRule.REVERSED_TXN_MATCH,
                        discrepancy_amount_minor=0,
                        currency=txn.currency,
                        explanation=f"Transaction {txn.paypal_transaction_id} successfully tracked as reversed (V).",
                    )
                )
                matched_txn_ids.add(txn.id)
                continue

            # Handle Refunds (e.g. T1107 or negative gross)
            if txn.transaction_event_code == "T1107" or txn.amount_minor < 0:
                parent_id = txn.parent_transaction_id or txn.custom_field or "PARENT"
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=None,
                        match_state=ReconMatchState.PARTIALLY_MATCHED,
                        match_rule=ReconMatchRule.PARTIAL_REFUND_MATCH,
                        discrepancy_amount_minor=abs(txn.amount_minor),
                        currency=txn.currency,
                        explanation=f"Refund of {txn.amount_minor} minor units associated with parent {parent_id}.",
                    )
                )
                matched_txn_ids.add(txn.id)
                continue

            # Match Candidates
            candidate_order: MerchantOrder | None = None
            match_rule = ReconMatchRule.EXACT_PAYPAL_REF

            if txn.paypal_transaction_id in orders_by_paypal_ref:
                candidate_order = orders_by_paypal_ref[txn.paypal_transaction_id]
                match_rule = ReconMatchRule.EXACT_PAYPAL_REF
            elif txn.invoice_id and txn.invoice_id in orders_by_invoice:
                candidate_order = orders_by_invoice[txn.invoice_id]
                match_rule = ReconMatchRule.INVOICE_REF_EXACT
            elif txn.custom_field and txn.custom_field in orders_by_id:
                candidate_order = orders_by_id[txn.custom_field]
                match_rule = ReconMatchRule.ORDER_REF_EXACT

            if not candidate_order:
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=None,
                        match_state=ReconMatchState.MISSING_ORDER,
                        match_rule=ReconMatchRule.UNLINKED_PAYMENT,
                        discrepancy_amount_minor=txn.amount_minor,
                        currency=txn.currency,
                        explanation=f"PayPal transaction {txn.paypal_transaction_id} has no matching order or invoice reference.",
                    )
                )
                matched_txn_ids.add(txn.id)
                continue

            # Compare currency
            if candidate_order.currency.upper() != txn.currency.upper():
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=candidate_order.order_id,
                        match_state=ReconMatchState.CURRENCY_MISMATCH,
                        match_rule=match_rule,
                        discrepancy_amount_minor=0,
                        currency=txn.currency,
                        explanation=f"Currency mismatch: PayPal transaction is in {txn.currency} but order is in {candidate_order.currency}.",
                    )
                )
                matched_txn_ids.add(txn.id)
                matched_order_ids.add(candidate_order.order_id)
                continue

            # Compare amount
            discrepancy = txn.amount_minor - candidate_order.amount_minor
            if discrepancy != 0:
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=candidate_order.order_id,
                        match_state=ReconMatchState.AMOUNT_MISMATCH,
                        match_rule=match_rule,
                        discrepancy_amount_minor=discrepancy,
                        currency=txn.currency,
                        explanation=f"Amount variance: PayPal received {txn.amount_minor} vs order total {candidate_order.amount_minor} ({discrepancy:+d} minor units).",
                    )
                )
            else:
                matches.append(
                    ReconMatch(
                        transaction_id=txn.paypal_transaction_id,
                        order_id=candidate_order.order_id,
                        match_state=ReconMatchState.MATCHED,
                        match_rule=match_rule,
                        discrepancy_amount_minor=0,
                        currency=txn.currency,
                        explanation=f"Exact match on {match_rule.value} with identical amount ({txn.amount_minor} {txn.currency}).",
                    )
                )

            matched_txn_ids.add(txn.id)
            matched_order_ids.add(candidate_order.order_id)

        # Process Orders that had no corresponding transaction
        for order in orders:
            if order.order_id not in matched_order_ids:
                matches.append(
                    ReconMatch(
                        transaction_id=None,
                        order_id=order.order_id,
                        match_state=ReconMatchState.UNMATCHED,
                        match_rule=ReconMatchRule.MISSING_PAYMENT,
                        discrepancy_amount_minor=order.amount_minor,
                        currency=order.currency,
                        explanation=f"Order {order.order_id} recorded in merchant system has no captured PayPal transaction.",
                    )
                )

        return matches
