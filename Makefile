.PHONY: dev test lint migrate seed install

# ── Local dev ─────────────────────────────────────────────────────────────────
dev:
	docker compose up

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

# ── Install ───────────────────────────────────────────────────────────────────
install:
	cd backend && pip install -e ".[dev]"
	cd frontend && npm ci

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend

lint-backend:
	cd backend && ruff check . && mypy app/

lint-frontend:
	cd frontend && npm run lint && npx tsc --noEmit

# ── Test ──────────────────────────────────────────────────────────────────────
test: test-backend

test-backend:
	cd backend && pytest -v

test-e2e:
	cd frontend && npx playwright test

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	cd backend && alembic upgrade head

migrate-auto:
	cd backend && alembic revision --autogenerate -m "$(MSG)"

migrate-down:
	cd backend && alembic downgrade -1

# ── Seed ─────────────────────────────────────────────────────────────────────
seed:
	@echo "🌱 Loading Lucentra demo data (clearly labeled [Demo Data])..."
	cd backend && python scripts/seed.py

# ── Helpers ───────────────────────────────────────────────────────────────────
format:
	cd backend && ruff format .
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"

clean:
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
