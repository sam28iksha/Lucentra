"""Pytest fixtures for Lucentra backend tests."""

from __future__ import annotations

import os

# Ensure required environment variables for test config
os.environ.setdefault("PAYPAL_CLIENT_ID", "test_client_id")
os.environ.setdefault("PAYPAL_CLIENT_SECRET", "test_client_secret")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://lucentra:lucentra@localhost:5432/lucentra_test")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret_0123456789abcdef0123456789")
os.environ.setdefault("SANDBOX_MODE", "true")
os.environ.setdefault("ENVIRONMENT", "test")
