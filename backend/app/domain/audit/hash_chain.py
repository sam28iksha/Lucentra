"""Cryptographic audit hash chain helpers.

Every audit event is cryptographically linked to the previous event hash:
event_hash = sha256(prev_hash + canonical_json(event_payload))

Canonical JSON guarantees deterministic byte representations across architectures:
- UTF-8 encoded
- Sorted keys
- Compact separators (no extra whitespace)
- Float/datetime ISO 8601 serialized
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Sequence
from typing import Any


def canonical_json(data: dict[str, Any]) -> str:
    """Serialize dictionary to deterministic, canonical JSON."""
    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=str,
    )


def compute_event_hash(prev_hash: str, event_data: dict[str, Any]) -> str:
    """Compute SHA-256 hash for a new audit block linked to prev_hash."""
    canonical_repr = canonical_json(event_data)
    combined = f"{prev_hash}{canonical_repr}".encode()
    return hashlib.sha256(combined).hexdigest()


def verify_chain(events: Sequence[dict[str, Any]]) -> tuple[bool, str | None]:
    """Verify integrity of a sequence of audit event dicts.

    Returns:
        (True, None) if the hash chain is intact.
        (False, broken_event_id) if tampering or discrepancy is detected.
    """
    if not events:
        return True, None

    for i, event in enumerate(events):
        curr_hash = event.get("event_hash")
        prev_hash = event.get("prev_hash")
        event_id = str(event.get("id", f"index_{i}"))

        # Payload excluded from hashing itself
        payload = {k: v for k, v in event.items() if k not in ("event_hash", "id", "prev_hash")}
        expected_hash = compute_event_hash(prev_hash or "", payload)

        if curr_hash != expected_hash:
            return False, event_id

        # Verify link to previous event
        if i > 0:
            last_event_hash = events[i - 1].get("event_hash")
            if prev_hash != last_event_hash:
                return False, event_id

    return True, None
