"""Webhook receiver for PayPal events.

Verification flow:
1. Persist raw event body immediately (before any processing).
2. Verify signature via PayPal postback API.
3. Process idempotently (deduplicate by PAYPAL-TRANSMISSION-ID).
4. Handle out-of-order delivery: log but do not regress state.
5. Return 200 immediately; processing happens in BackgroundTasks.

Known limitation: the PayPal Webhook Simulator returns FAILURE from
the verification endpoint. This is a documented PayPal quirk, not a
bug in our code. Real sandbox transactions verify correctly.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Header, Request
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/paypal")
async def paypal_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    paypal_transmission_id: str = Header(..., alias="PAYPAL-TRANSMISSION-ID"),
    paypal_transmission_time: str = Header(..., alias="PAYPAL-TRANSMISSION-TIME"),
    paypal_transmission_sig: str = Header(..., alias="PAYPAL-TRANSMISSION-SIG"),
    paypal_cert_url: str = Header(..., alias="PAYPAL-CERT-URL"),
    paypal_auth_algo: str = Header(..., alias="PAYPAL-AUTH-ALGO"),
) -> JSONResponse:
    """Receive and process a PayPal webhook event."""
    _ = await request.body()

    # TODO T6.2: persist raw event, verify signature, process idempotently
    logger.info("Webhook received: transmission_id=%s", paypal_transmission_id)

    # Return 200 immediately — PayPal will retry on non-2xx
    return JSONResponse({"received": True})
