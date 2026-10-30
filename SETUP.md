# Lucentra — Developer Setup (Mac, No Docker)

Docker is not used in this project. The backend and frontend run directly on
your Mac using a Python 3.12 virtual environment and Node, connected to a
hosted Neon Postgres database.

---

## 1. Prerequisites

| Tool | Required version | Check |
|------|-----------------|-------|
| **Python 3.12** | `3.12.x` (not 3.13+) | `python3.12 --version` |
| **Node.js** | `20` or `22` | `node --version` |
| **npm** | bundled with Node | `npm --version` |
| **make** | system default | `make --version` |

> **Why Python 3.12 explicitly?** macOS's default `python3` may resolve to 3.13
> or later. `asyncpg` and some SQLAlchemy extensions require 3.12-compatible
> wheels. Always create the venv with `python3.12 -m venv`.

Install via Homebrew if needed:
```bash
brew install python@3.12 node@22
```

---

## 2. Clone & Environment Setup

```bash
git clone https://github.com/sam28iksha/Lucentra.git
cd Lucentra
```

### 2a. Backend virtual environment

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
cd backend && pip install -e ".[dev]" && cd ..
```

### 2b. Frontend dependencies

```bash
cd frontend && npm ci && cd ..
```

### 2c. Environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and fill in **at minimum**:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Neon dashboard → your project → **Connection string → Direct** (see §3) |
| `PAYPAL_CLIENT_ID` | [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox) → Sandbox app |
| `PAYPAL_CLIENT_SECRET` | same Sandbox app |
| `JWT_SECRET` | run `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `AI_API_KEY` | Anthropic Console (optional for core features) |

The `frontend/.env` default (`VITE_API_BASE_URL=http://localhost:8001`) works
as-is for local dev.

---

## 3. Neon Database — Direct Connection

Lucentra connects to a **Neon Postgres** instance in the cloud. No local
Postgres is required.

### 3a. Get the direct connection string

1. Open [console.neon.tech](https://console.neon.tech) → your project.
2. Under **Connection Details**, select:
   - Branch: `production` (or `main`)
   - Database: `neondb`
   - Mode: switch the toggle to **Direct** (port 5432, hostname without `-pooler`).
3. Select driver **asyncpg** or format the connection string as:
   ```env
   DATABASE_URL=postgresql+asyncpg://neondb_owner:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?ssl=require
   ```

> ⚠️ **Important Format Notes**:
> - Must start with `postgresql+asyncpg://` (not `postgresql://`).
> - Parameter is `?ssl=require` (not `sslmode=require` and omit `channel_binding`).
> - Must use direct hostname (no `-pooler` in the host).

### 3b. ⚠️ asyncpg + Neon pooler caveat

Neon provides two connection endpoints:

| Endpoint | Port | Mode |
|----------|------|------|
| **Direct** | 5432 | Full PostgreSQL session |
| **Pooled** (PgBouncer) | 6543 | Transaction pooling |

**Always use the Direct endpoint with asyncpg.**

PgBouncer in transaction-pooling mode disables prepared statements and session
state between queries. asyncpg uses both extensively. Using the pooled string
will cause `prepared statement does not exist` errors and session leaks.

---

## 4. Apply Migrations & Seed

```bash
source backend/.venv/bin/activate   # if not already active

make migrate    # runs: cd backend && alembic upgrade head
make seed       # runs: cd backend && python scripts/seed.py  (idempotent)
```

---

## 5. Run Locally

```bash
make dev        # starts backend :8001 + frontend :5174, Ctrl-C stops both
```

Or run each in a separate terminal:

```bash
# Terminal 1
make backend    # uvicorn app.main:app --reload --port 8001

# Terminal 2
make frontend   # npm run dev -- --port 5174
```

### Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:8001 |
| Swagger / Docs | http://localhost:8001/api/docs |
| Health check | http://localhost:8001/health |

---

## 6. All Makefile Targets

| Command | What it does |
|---------|-------------|
| `make dev` | Start backend + frontend concurrently (Ctrl-C stops both) |
| `make backend` | Backend only (`uvicorn` on :8001, hot-reload) |
| `make frontend` | Frontend only (`vite` on :5174) |
| `make install` | `pip install -e ".[dev]"` + `npm ci` |
| `make migrate` | `alembic upgrade head` |
| `make migrate-auto MSG="..."` | Generate new migration from model diff |
| `make migrate-down` | Roll back one migration |
| `make seed` | Load demo data (idempotent) |
| `make test` | Run backend pytest suite |
| `make lint` | ruff + mypy (backend) + tsc (frontend) |
| `make format` | ruff format + prettier |
| `make clean` | Remove `__pycache__` and `.pyc` files |

---

## 7. Testing & Linting

```bash
source backend/.venv/bin/activate

# Run all backend tests
make test-backend

# Type check
cd backend && mypy app/

# Lint
cd backend && ruff check .

# Frontend type check
cd frontend && npx tsc --noEmit
```

---

## 8. Database Migrations

```bash
# Apply all pending migrations
make migrate

# Create a new auto-generated migration
make migrate-auto MSG="add merchant_id column"

# Roll back one step
make migrate-down

# Connect to Neon directly (psql)
psql "postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/DBNAME?sslmode=require"
```

---

## 9. Troubleshooting

### `python3.12: command not found`
Install via Homebrew: `brew install python@3.12`  
Then symlink or use the full path: `/opt/homebrew/bin/python3.12`

### `asyncpg` build fails (no `pg_config`)
asyncpg uses a bundled libpq — you do **not** need PostgreSQL installed locally.
If the pip install fails, ensure Xcode Command Line Tools are present:
```bash
xcode-select --install
```

### `connect() got an unexpected keyword argument 'sslmode'`
`asyncpg` takes `ssl=require`, not `sslmode=require` or `channel_binding=require`. Make sure your `DATABASE_URL` in `backend/.env` ends with `?ssl=require`.

### `prepared statement does not exist` error
You are using the Neon **pooled** (PgBouncer) connection string. Switch to the
**direct** connection string (port 5432, remove `-pooler` from hostname) in `backend/.env`.

### Port conflicts
Change the ports via env vars — no config files to edit:
- Backend: set `UVICORN_PORT=8002` or just run `uvicorn app.main:app --port 8002`
- Frontend: set `VITE_PORT=5175` in `frontend/.env` or run `make frontend` after editing `vite.config.ts`

### CORS errors in the browser
Ensure `CORS_ORIGINS` in `backend/.env` includes the exact frontend origin, e.g.:
```
CORS_ORIGINS=http://localhost:5174
```

---

## 10. Deployment (Render)

The `render.yaml` file deploys:
- **lucentra-backend** — Python web service (FastAPI via uvicorn)
- **lucentra-frontend** — Static site (Vite build output)

The database stays on **Neon** — no Render Postgres is provisioned.

Set `DATABASE_URL` (Neon direct string) and all other secrets in the **Render
dashboard** under Environment → Secret Files / Environment Variables.
Never commit `.env` files.
