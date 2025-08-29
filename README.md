# Backend Implementation

Generate a survey from a short description, store it in Postgres, and auto-fill the frontend.  
Same description ⇒ same survey (fetched from DB).

---

## Tech Choices

**Why FastAPI (over Flask)**
- Pydantic models for typed request/response validation.
- Built-in dependency injection (clean DB session handling).
- Auto-generated docs (`/docs`, `/redoc`) and fast ASGI server (Uvicorn).

**Key Libraries**
- **FastAPI** + **Uvicorn** — web framework & server.
- **SQLAlchemy** + **psycopg2-binary** — ORM & Postgres driver.
- **pydantic / pydantic-settings / python-dotenv** — validation & config via env.
- **openai** — LLM integration if `OPENAI_API_KEY` is present.
- **slowapi** — simple rate limiting (off by default).

**Design Notes**
- Clear separation: routes (`main.py`), schemas (`schemas.py`), models (`models.py`), services (`services/`), DB wiring (`db.py`).
- LLM is **pluggable**: uses OpenAI when a key exists, otherwise a **deterministic mock** so the app runs without secrets.
- **Caching** by input description with a DB uniqueness constraint.

---

## Setup & Run

**Prereqs:** Python 3.11, Node 18+, Docker (for Postgres)

### 1) Database
```bash
docker compose up -d db

### 2) Backend
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```
Create a .env file in the project root:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/surveys
API_TOKEN=dev-token
CORS_ORIGINS=http://localhost:3000
OPENAI_API_KEY=        # optional
RATE_LIMIT=10/minute
```
Run the API:
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 3) Frontend
```bash
cd frontend
npm install
```
Create frontend/.env.local:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_TOKEN=dev-token
```

Run:
```bash
npm start
```

## Areas of Focus

Clean architecture: routes ↔ services ↔ models separated; DB via DI (get_db).

Reliable storage & idempotency: unique constraint on description; race-safe get-or-create.

LLM integration with safe fallback: optional OpenAI; deterministic mock when no key is provided.

Security & robustness: simple Bearer token check; CORS restricted to the frontend origin.

Frontend UX: one-click Generate Survey that auto-fills title/description/questions from the API.
