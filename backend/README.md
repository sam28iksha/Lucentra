# Lucentra Backend

FastAPI asynchronous backend for Lucentra: AI-powered payment dispute triage, 14-scenario reconciliation, and cryptographic audit hash chaining for PayPal merchants.

## Prerequisites
- Python 3.12 (`python3.12 -m venv .venv`)
- Neon PostgreSQL connection string (direct endpoint, port 5432)

## Running Locally

```bash
# 1. Activate environment
python3.12 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -e ".[dev]"

# 3. Configure environment
cp .env.example .env
# Set DATABASE_URL=postgresql+asyncpg://<USER>:<PASS>@<HOST>/<DB>?ssl=require

# 4. Run migrations
alembic upgrade head

# 5. Start dev server
uvicorn app.main:app --reload --port 8001
```

## Running Tests & Quality Checks

```bash
pytest -v          # run 26+ async tests
mypy app/          # static type checking
ruff check .       # code style and linting
```

