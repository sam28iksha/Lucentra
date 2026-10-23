"""Tests for cryptographic audit hash chain integrity and tamper detection."""

from __future__ import annotations

from app.domain.audit.hash_chain import (
    canonical_json,
    compute_event_hash,
    verify_chain,
)


def test_canonical_json_deterministic_ordering() -> None:
    """Keys must be sorted so identical dicts yield identical canonical strings."""
    d1 = {"b": 2, "a": 1, "nested": {"y": 20, "x": 10}}
    d2 = {"a": 1, "nested": {"x": 10, "y": 20}, "b": 2}
    assert canonical_json(d1) == canonical_json(d2)


def test_valid_hash_chain_verifies_successfully() -> None:
    """A valid unbroken sequence of events passes verification."""
    genesis_prev = "GENESIS"
    e1_payload = {"actor": "system", "action": "INITIALIZE", "seq": 1}
    e1_hash = compute_event_hash(genesis_prev, e1_payload)
    e1 = {"id": "1", "prev_hash": genesis_prev, "event_hash": e1_hash, **e1_payload}

    e2_payload = {"actor": "merchant", "action": "OVERRIDE_RECON", "seq": 2}
    e2_hash = compute_event_hash(e1_hash, e2_payload)
    e2 = {"id": "2", "prev_hash": e1_hash, "event_hash": e2_hash, **e2_payload}

    valid, broken_id = verify_chain([e1, e2])
    assert valid is True
    assert broken_id is None


def test_tampered_payload_detected_by_chain() -> None:
    """Modifying an event payload after the fact breaks the hash chain."""
    genesis_prev = "GENESIS"
    e1_payload = {"actor": "system", "action": "INITIALIZE", "seq": 1}
    e1_hash = compute_event_hash(genesis_prev, e1_payload)
    e1 = {"id": "1", "prev_hash": genesis_prev, "event_hash": e1_hash, **e1_payload}

    # Malicious actor changes the action text in e1
    e1["action"] = "TAMPERED_ACTION"

    valid, broken_id = verify_chain([e1])
    assert valid is False
    assert broken_id == "1"


def test_broken_link_detected_between_blocks() -> None:
    """If block 2 does not point to block 1's hash, chain reports broken."""
    genesis_prev = "GENESIS"
    e1_payload = {"action": "A", "seq": 1}
    e1_hash = compute_event_hash(genesis_prev, e1_payload)
    e1 = {"id": "1", "prev_hash": genesis_prev, "event_hash": e1_hash, **e1_payload}

    e2_payload = {"action": "B", "seq": 2}
    # Bad pointer:
    e2_hash = compute_event_hash("FORGED_PREV_HASH", e2_payload)
    e2 = {"id": "2", "prev_hash": "FORGED_PREV_HASH", "event_hash": e2_hash, **e2_payload}

    valid, broken_id = verify_chain([e1, e2])
    assert valid is False
    assert broken_id == "2"
