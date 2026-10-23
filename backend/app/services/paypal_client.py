"""PayPal Sandbox API client with OAuth token caching, exponential backoff, and retry logic.

Token is NEVER logged and NEVER returned to the frontend.
All interactions execute against PayPal Sandbox endpoints.
"""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import UTC, datetime
from typing import Any, cast

import httpx

from app.config import settings

logger = logging.getLogger("lucentra.paypal")


class PayPalAPIError(Exception):
    """Base exception for PayPal API errors."""

    def __init__(self, message: str, status_code: int = 500, details: Any = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.details = details


class PayPalClient:
    """Async client for PayPal Sandbox APIs with robust token management."""

    def __init__(self) -> None:
        self.base_url = settings.paypal_base_url_str
        self.client_id = settings.paypal_client_id
        self.client_secret = settings.paypal_client_secret

        # In-process token cache
        self._access_token: str | None = None
        self._token_expires_at: float = 0.0
        self._lock = asyncio.Lock()

    async def get_access_token(self, force_refresh: bool = False) -> str:
        """Obtain or return a cached OAuth 2.0 bearer token.

        Refreshes automatically 60 seconds before expiration.
        """
        now = time.time()
        if not force_refresh and self._access_token and (self._token_expires_at - now > 60):
            return self._access_token

        async with self._lock:
            # Recheck after acquiring lock
            now = time.time()
            if not force_refresh and self._access_token and (self._token_expires_at - now > 60):
                return self._access_token

            url = f"{self.base_url}/v1/oauth2/token"
            async with httpx.AsyncClient(timeout=15.0) as client:
                try:
                    response = await client.post(
                        url,
                        data={"grant_type": "client_credentials"},
                        auth=(self.client_id, self.client_secret),
                        headers={"Accept": "application/json", "Accept-Language": "en_US"},
                    )
                except httpx.RequestError as exc:
                    logger.error("Network error requesting PayPal OAuth token: %s", exc)
                    raise PayPalAPIError("Failed to reach PayPal authentication server", 503) from exc

                if response.status_code != 200:
                    logger.error(
                        "PayPal OAuth failed with status %d: %s",
                        response.status_code,
                        response.text,
                    )
                    raise PayPalAPIError(
                        f"PayPal OAuth error: HTTP {response.status_code}",
                        status_code=response.status_code,
                    )

                data = cast(dict[str, Any], response.json())
                token_val = data.get("access_token")
                expires_in = data.get("expires_in", 32400)  # default ~9h

                if not token_val:
                    raise PayPalAPIError("Malformed token response from PayPal", 502)

                token = str(token_val)
                self._access_token = token
                self._token_expires_at = time.time() + float(expires_in)
                logger.info("Successfully refreshed PayPal OAuth token (valid for %ss)", expires_in)
                return token

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        max_retries: int = 3,
    ) -> dict[str, Any]:
        """Execute an authenticated request with retry on 429 and auto-refresh on 401."""
        url = f"{self.base_url}{path if path.startswith('/') else f'/{path}'}"
        req_headers = headers.copy() if headers else {}
        req_headers.setdefault("Content-Type", "application/json")
        req_headers.setdefault("Accept", "application/json")

        for attempt in range(max_retries):
            token = await self.get_access_token()
            req_headers["Authorization"] = f"Bearer {token}"

            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    response = await client.request(
                        method,
                        url,
                        params=params,
                        json=json,
                        headers=req_headers,
                    )
                except httpx.RequestError as exc:
                    if attempt == max_retries - 1:
                        raise PayPalAPIError(f"PayPal connection error: {exc}", 503) from exc
                    await asyncio.sleep(2**attempt)
                    continue

                if response.status_code == 401 and attempt < max_retries - 1:
                    logger.warning("Received 401 from PayPal. Refreshing token and retrying...")
                    await self.get_access_token(force_refresh=True)
                    continue

                if response.status_code == 429:
                    if attempt == max_retries - 1:
                        raise PayPalAPIError("PayPal rate limit exceeded (429)", 429)
                    backoff = (2**attempt) + 0.5
                    logger.warning("PayPal rate limit hit. Backing off for %.1f s...", backoff)
                    await asyncio.sleep(backoff)
                    continue

                if response.status_code >= 400:
                    try:
                        err_payload = response.json()
                    except Exception:
                        err_payload = {"raw": response.text}
                    logger.error(
                        "PayPal API error [%s %s] HTTP %d: %s",
                        method,
                        path,
                        response.status_code,
                        err_payload,
                    )
                    raise PayPalAPIError(
                        f"PayPal API error {response.status_code}",
                        status_code=response.status_code,
                        details=err_payload,
                    )

                if response.status_code == 204:
                    return {}

                return cast(dict[str, Any], response.json())

        raise PayPalAPIError("Max retries exceeded for PayPal request", 504)

    # ── Transaction Reporting (Transaction Search) ───────────────────────────
    async def get_transactions(
        self,
        start_date: datetime,
        end_date: datetime,
        page: int = 1,
        page_size: int = 100,
    ) -> dict[str, Any]:
        """Fetch transactions from GET /v1/reporting/transactions.

        PayPal enforces a maximum 31-day window per request. Dates must be UTC ISO 8601.
        """
        fmt = "%Y-%m-%dT%H:%M:%SZ"
        start_str = start_date.astimezone(UTC).strftime(fmt)
        end_str = end_date.astimezone(UTC).strftime(fmt)

        params: dict[str, Any] = {
            "start_date": start_str,
            "end_date": end_str,
            "page": page,
            "page_size": min(page_size, 500),
            "fields": "all",
        }

        return await self._request("GET", "/v1/reporting/transactions", params=params)

    # ── Customer Disputes ───────────────────────────────────────────────────
    async def list_disputes(
        self,
        start_time: datetime | None = None,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """Fetch disputes from GET /v1/customer/disputes."""
        params: dict[str, Any] = {"page_size": page_size}
        if start_time:
            params["start_time"] = start_time.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

        return await self._request("GET", "/v1/customer/disputes", params=params)

    async def get_dispute(self, dispute_id: str) -> dict[str, Any]:
        """Fetch detailed dispute data from GET /v1/customer/disputes/{id}."""
        return await self._request("GET", f"/v1/customer/disputes/{dispute_id}")

    async def provide_evidence(self, dispute_id: str, evidence_data: dict[str, Any]) -> dict[str, Any]:
        """Submit evidence to POST /v1/customer/disputes/{id}/provide-evidence."""
        return await self._request(
            "POST",
            f"/v1/customer/disputes/{dispute_id}/provide-evidence",
            json=evidence_data,
        )

    # ── Webhook Signature Verification ──────────────────────────────────────
    async def verify_webhook_signature(
        self,
        *,
        transmission_id: str,
        transmission_time: str,
        cert_url: str,
        auth_algo: str,
        transmission_sig: str,
        webhook_id: str,
        webhook_event: dict[str, Any],
    ) -> bool:
        """Verify webhook signature via POST /v1/notifications/verify-webhook-signature."""
        payload = {
            "transmission_id": transmission_id,
            "transmission_time": transmission_time,
            "cert_url": cert_url,
            "auth_algo": auth_algo,
            "transmission_sig": transmission_sig,
            "webhook_id": webhook_id,
            "webhook_event": webhook_event,
        }

        try:
            res = await self._request("POST", "/v1/notifications/verify-webhook-signature", json=payload)
            status = str(res.get("verification_status", "")).upper()
            return status == "SUCCESS"
        except PayPalAPIError as exc:
            logger.warning("PayPal webhook verification check returned error: %s", exc)
            return False


# Singleton instance
paypal_client = PayPalClient()
