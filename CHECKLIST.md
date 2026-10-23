# Lucentra — Living Task Tracker

*PayPal AI Hackathon | Deadline: Nov 12, 2026, 12:00 noon Pacific (Nov 13, 1:30 AM IST)*

---

## ✅ Completed

- [x] **T1.1 Repo Skeleton & Tooling**: Configured `backend/pyproject.toml` (FastAPI, SQLAlchemy 2, Alembic, httpx, pydantic-settings, ruff, mypy, pytest), `frontend/package.json` (React 18, Vite, Tailwind, TanStack Query, Framer Motion, Lucide), `Makefile`, `docker-compose.yml`, `render.yaml`.
- [x] **T1.2 Database & ORM Models**: Created ORM models for `User`, `Transaction` (raw JSONB + composite index), `Dispute`, `ReconResult`, `AuditEvent` (append-only hash-chained), `Job`.
- [x] **T1.3 Design System & Tokens**: Implemented `tokens.css` with Lucentra Warm palette (`--brand-orange: #FF8A33`, `--brand-cream: #FAF7F2`, `--surface-card: #FFFFFF`), typography tokens (Fraunces serif, Inter, JetBrains Mono), responsive styles.
- [x] **T3.1 Landing Page**: Full layout implemented in `Landing.tsx` with sticky nav, two-column hero, mascot video with decorative SVG spark strokes, pill ask input, 3 feature cards, 4-step "How it works", FAQ accordion, footer disclaimer.
- [x] **T3.2 MascotVideo Component**: `<video>` tag with WebM / MP4 sources, `IntersectionObserver` pause-when-offscreen, `prefers-reduced-motion` poster fallback, and visible dashed placeholder fallback if assets are not yet dropped.
- [x] **T3.3 App Shell & Routing**: Navigation in `AppShell.tsx` and `App.tsx` with active indicator, persistent `SandboxBadge`, demo pill, and all 10 responsive pages:
  - `Landing.tsx` (public showcase)
  - `Dashboard.tsx` (KPI command center)
  - `Transactions.tsx` (PayPal ledger table)
  - `Reconciliation.tsx` (Auto-recon workspace)
  - `Disputes.tsx` (Dispute operations)
  - `Evidence.tsx` (AI evidence builder & claim validator)
  - `Deadlines.tsx` (Provider-confirmed deadlines)
  - `Audit.tsx` (SHA-256 hash chain verification)
  - `AskLucentra.tsx` (Deterministic SQL query assistant)
  - `Settings.tsx` & `Sandbox.tsx` (Developer tools)
- [x] **T2.1 PayPal Sandbox OAuth Client**: Implemented `paypal_client.py` with in-process token caching, auto-refresh 60s before expiry, exponential backoff with jitter on 429, single retry on 401, security guard against logging secrets. Tested with 5 passing unit tests.
- [x] **T2.2 Transaction Ingestion Service**: Implemented `transaction_service.py` with sliding 31-day window pagination, integer minor units money conversion, normalization from raw JSONB, composite key deduplication. Tested with unit tests.
- [x] **T4.1 Pure Reconciliation Engine**: Implemented `engine.py` with deterministic matching hierarchy (exact ref, invoice ref, amount/currency validation, status handling for refunds/reversals/pending, duplicate detection).
- [x] **T4.2 All 14 Reconciliation Test Scenarios**: Implemented and verified in `backend/tests/test_recon/test_engine.py` (Exact match, missing order, missing payment, amount mismatch, currency mismatch, duplicate candidate, partial refund, multiple refunds, repeated webhook idempotency, out-of-order events, pending payment, reversed transaction, manual correction, rerun without duplicates).
- [x] **T5.1 Cryptographic Audit Hash Chain**: Implemented `hash_chain.py` with deterministic `canonical_json`, `compute_event_hash` (SHA-256 over `prev_hash + canonical_json`), and `verify_chain` tamper detection. Tested with unit tests.

---

## 🔄 In Progress

- [ ] **Stage 6 Disputes Integration**: PayPal Disputes API sync service & router endpoints (`/v1/customer/disputes` ingestion).
- [ ] **Stage 7 AI Evidence Backend**: Deterministic claim validator connection to LLM provider (Claude 3.5 Sonnet / OpenAI fallback).

---

## ⬜ Not Started

- [ ] **T6.2 Webhook Signature Verification**: Real sandbox postback verification endpoint.
- [ ] **T8.2 AG Studio Dashboard Plugin**: Live AG Studio widgets connection.
- [ ] **T9.1 Playwright E2E Test**: Golden path automation script.
- [ ] **T10.1 Demo Seed Script**: `make seed` CLI populator.
- [ ] **T10.2 Documentation**: `docs/SETUP_YOUR_SIDE.md`, `docs/APIMATIC_USAGE.md`, `docs/SPONSOR_NOTES.md`.

---

## ❌ Blocked (with reason)

- None. Both frontend and backend compile and build cleanly with 0 errors.

---

## 🧪 Untested

- Live PayPal API calls against actual user sandbox credentials (pending user adding their sandbox client id and secret to `.env`).
