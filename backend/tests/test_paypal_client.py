"""Tests for PayPalClient — OAuth token cache, 401 refresh, 429 backoff."""

from __future__ import annotations

import time
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.paypal_client import PayPalClient


@pytest.fixture
def client() -> PayPalClient:
    return PayPalClient()


@pytest.mark.asyncio
async def test_token_cache_returns_cached_token_when_valid(client: PayPalClient) -> None:
    """When a token is already cached and not near expiry, return it without HTTP call."""
    client._access_token = "cached_test_token"
    client._token_expires_at = time.time() + 3600  # 1 hour remaining

    token = await client.get_access_token()
    assert token == "cached_test_token"


@pytest.mark.asyncio
async def test_token_refreshes_when_near_expiry(client: PayPalClient) -> None:
    """When token has less than 60s remaining, fetch new token."""
    client._access_token = "stale_token"
    client._token_expires_at = time.time() + 30  # only 30s left

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"access_token": "fresh_new_token", "expires_in": 3600}

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_resp):
        token = await client.get_access_token()
        assert token == "fresh_new_token"
        assert client._access_token == "fresh_new_token"


@pytest.mark.asyncio
async def test_get_transactions_date_formatting(client: PayPalClient) -> None:
    """Ensure start_date and end_date are serialized to UTC RFC3339 string."""
    start = datetime(2026, 10, 1, 10, 0, tzinfo=UTC)
    end = datetime(2026, 10, 20, 15, 30, tzinfo=UTC)

    client.get_access_token = AsyncMock(return_value="valid_token")  # type: ignore[method-assign]

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"transaction_details": [], "total_pages": 1}

    with patch("httpx.AsyncClient.request", new_callable=AsyncMock, return_value=mock_resp) as mock_req:
        res = await client.get_transactions(start, end, page=1)
        assert res == {"transaction_details": [], "total_pages": 1}
        mock_req.assert_called_once()
        params = mock_req.call_args[1]["params"]
        assert params["start_date"] == "2026-10-01T10:00:00Z"
        assert params["end_date"] == "2026-10-20T15:30:00Z"
        assert params["page"] == 1


@pytest.mark.asyncio
async def test_auto_refresh_on_401(client: PayPalClient) -> None:
    """Client automatically refreshes token once when 401 Unauthorized is returned."""
    client.get_access_token = AsyncMock(return_value="refreshed_token")  # type: ignore[method-assign]

    mock_401 = MagicMock(status_code=401, text="Unauthorized")
    mock_200 = MagicMock(status_code=200)
    mock_200.json.return_value = {"success": True}

    with patch("httpx.AsyncClient.request", new_callable=AsyncMock, side_effect=[mock_401, mock_200]):
        res = await client._request("GET", "/v1/test")
        assert res == {"success": True}
        assert client.get_access_token.call_count >= 2


@pytest.mark.asyncio
async def test_rate_limit_429_exponential_backoff(client: PayPalClient) -> None:
    """Client backs off on 429 rate limit before succeeding."""
    client.get_access_token = AsyncMock(return_value="test_token")  # type: ignore[method-assign]

    mock_429 = MagicMock(status_code=429, text="Rate limit exceeded")
    mock_200 = MagicMock(status_code=200)
    mock_200.json.return_value = {"data": "ok"}

    with patch(
        "httpx.AsyncClient.request", new_callable=AsyncMock, side_effect=[mock_429, mock_200]
    ), patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        res = await client._request("GET", "/v1/test")
        assert res == {"data": "ok"}
        mock_sleep.assert_called_once()
