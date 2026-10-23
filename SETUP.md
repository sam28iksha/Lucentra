# Lucentra Developer Onboarding & Setup Guide 🚀

Welcome to the **Lucentra** team! This guide walks you step-by-step through setting up, running, testing, and developing the Lucentra platform on your local machine.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Quickstart with Docker (Recommended)](#2-quickstart-with-docker-recommended)
3. [Port Allocation & Architecture](#3-port-allocation--architecture)
4. [Setting Up API Keys & Credentials](#4-setting-up-api-keys--credentials)
5. [Database Migrations & Management](#5-database-migrations--management)
6. [Alternative: Local Bare-Metal Development](#6-alternative-local-bare-metal-development)
7. [Running Tests & Linting](#7-running-tests--code-quality)
8. [Useful Makefile Shortcuts](#8-useful-makefile-shortcuts)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Prerequisites

Before starting, ensure you have the following installed:

| Tool | Recommended Version | Verify Command |
| :--- | :--- | :--- |
| **Git** | `2.40+` | `git --version` |
| **Docker Desktop** | `24.0+` (Compose v2+) | `docker compose version` |
| **Node.js** *(Optional for local dev)* | `v20.x+` (LTS) | `node -v` |
| **Python** *(Optional for local dev)* | `3.12+` | `python3 --version` |

---

## 2. Quickstart with Docker (Recommended)

Docker Compose manages PostgreSQL 15, the FastAPI backend, and the Vite frontend with hot-reloading enabled out of the box.

### Step 1: Clone the Repository
```bash
git clone https://github.com/sam28iksha/Lucentra.git
cd Lucentra
```

### Step 2: Configure Environment Files
Copy the sample environment configurations:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
*(The default `.env` files are pre-configured to work immediately for local testing and domain simulation without needing external keys upfront).*

### Step 3: Launch Containers
```bash
docker compose up -d --build
```
This builds:
- `lucentra-postgres-1` (PostgreSQL 15 on port `5433`)
- `lucentra-backend-1` (FastAPI on port `8001`)
- `lucentra-frontend-1` (React + Vite on port `5174`)

### Step 4: Apply Database Migrations
Once the database container is healthy (takes ~5 seconds), run the initial Alembic migration:
```bash
docker compose exec backend alembic upgrade head
```

### Step 5: Verify Everything is Running
Open your browser to:
- 🌐 **Web Application**: [http://localhost:5174](http://localhost:5174)
- 📖 **Interactive API Documentation (Swagger)**: [http://localhost:8001/api/docs](http://localhost:8001/api/docs)
- 🩺 **Health Check**: [http://localhost:8001/health](http://localhost:8001/health)

---

## 3. Port Allocation & Architecture

To avoid collisions with other projects or default dev servers (like default Vite `5173`, FastAPI `8000`, or system Postgres `5432`), Lucentra is mapped to dedicated ports:

| Service | Host Port | Container Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | `5174` | `5173` | React 18 + Vite Web App |
| **Backend API** | `8001` | `8000` | FastAPI Async REST API |
| **PostgreSQL** | `5433` | `5432` | Persistence database |

> 💡 **Vite Proxy**: The frontend dev server is configured with a reverse proxy in `frontend/vite.config.ts`. Any requests to `/api/*` or `/webhooks/*` are automatically forwarded to `http://localhost:8001`.

---

## 4. Setting Up API Keys & Credentials

### A. PayPal Developer Sandbox
To test live sync with PayPal's Sandbox APIs:
1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Under **REST API apps**, create a new App (or use the Default Application).
3. Copy the **Client ID** and **Secret**.
4. Open `backend/.env` and update:
   ```env
   PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
   PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
   ```

### B. Anthropic Claude (For AI Dispute Rebuttal Generation)
Lucentra uses Claude 3.5 Sonnet to synthesize bank-ready dispute evidence packages:
1. Obtain an API key from [Anthropic Console](https://console.anthropic.com/).
2. Add your key in `backend/.env`:
   ```env
   AI_PROVIDER=anthropic
   AI_MODEL=claude-3-5-sonnet-20241022
   AI_API_KEY=sk-ant-api03-...
   ```

---

## 5. Database Migrations & Management

All database schema changes are managed via **Alembic**.

### Apply Migrations
```bash
docker compose exec backend alembic upgrade head
```

### Create a New Migration After Changing ORM Models
1. Modify or add models in `backend/app/db/models/`.
2. Generate an auto-migration script:
   ```bash
   docker compose exec backend alembic revision --autogenerate -m "describe your changes"
   ```
3. Inspect the newly created file in `backend/alembic/versions/`.
4. Apply it:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

### Rollback Last Migration
```bash
docker compose exec backend alembic downgrade -1
```

### Direct Database Access
Connect to the Postgres database using `psql`:
```bash
# Via Docker
docker compose exec postgres psql -U lucentra -d lucentra

# Or from your host machine (if psql is installed)
psql -h localhost -p 5433 -U lucentra -d lucentra
```

---

## 6. Alternative: Local Bare-Metal Development

If you prefer running services directly on your host machine without Docker:

### Step 1: Start PostgreSQL
You can either use a local PostgreSQL instance or run just Postgres via Docker:
```bash
docker compose up -d postgres
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment (using uv or python venv)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies in editable mode with dev packages
pip install -e ".[dev]"

# Ensure database URL in backend/.env points to localhost:5433
# DATABASE_URL=postgresql+asyncpg://lucentra:lucentra@localhost:5433/lucentra

# Run database migrations
alembic upgrade head

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8001
```

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server on port 5174
npm run dev -- --port 5174
```

---

## 7. Running Tests & Code Quality

We maintain 100% strict typing with `mypy` and linting with `ruff`. Always ensure all tests pass before submitting a pull request.

### Running Backend Unit & Domain Tests
```bash
# In Docker:
docker compose exec backend pytest -v

# Locally:
cd backend && pytest -v
```

### Strict Type Checking (`mypy`)
```bash
# In Docker:
docker compose exec backend mypy app/

# Locally:
cd backend && mypy app/
```

### Linter & Code Formatting (`ruff`)
```bash
# Check code style:
docker compose exec backend ruff check .

# Auto-fix formatting:
docker compose exec backend ruff format .
```

### Frontend Typecheck & Build Validation
```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

---

## 8. Useful Makefile Shortcuts

From the root directory, you can run:

```bash
make dev            # Run docker compose up
make lint           # Run both backend and frontend linters
make test           # Run backend test suite
make migrate        # Apply database migrations
make clean          # Remove Python __pycache__ and .pyc files
```

---

## 9. Troubleshooting & FAQs

### Q1: `Error starting userland proxy: listen tcp4 0.0.0.0:8001: bind: address already in use`
**Cause**: Another application is using port `8001` (or `5174`, `5433`).
**Solution**:
1. Check what process is listening: `lsof -i :8001`
2. If another service must remain on that port, update the host port in `docker-compose.yml`:
   ```yaml
   ports:
     - "8002:8000"   # Change left side (host port)
   ```
3. Update `frontend/.env` to point to the new host port.

### Q2: `alembic: command not found` or `No 'script_location' key found`
**Solution**: Ensure you run alembic from the `backend/` directory or inside the backend container where `alembic.ini` is located at `/app/alembic.ini`.
```bash
docker compose exec backend alembic upgrade head
```

### Q3: How do I view live logs for debugging?
```bash
# All containers:
docker compose logs -f

# Backend only:
docker compose logs -f backend

# Frontend only:
docker compose logs -f frontend
```

### Q4: How do I stop the containers?
```bash
# Stop containers (preserves database data volume):
docker compose down

# Stop containers and wipe the database:
docker compose down -v
```

---

## 🤝 Questions & Support
For any questions or onboarding issues, open a GitHub Discussion or coordinate on the team Slack/Discord channel!
