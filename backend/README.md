# Lucentra Backend

AI-powered payment dispute, reconciliation and revenue-protection platform for merchants who use PayPal.

## Running Locally

```bash
uv venv --python 3.12 .venv
source .venv/bin/activate
uv pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Running Tests

```bash
pytest
```
