# Deployment & Operations Guide

## 1. Local Development Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.11+
- git

### Step 1: Backend Setup
```bash
# From workspace root
uv venv backend/.venv
uv pip install -r backend/requirements.txt --python backend/.venv/Scripts/python.exe

# Run migrations / database seed
backend/.venv/Scripts/python.exe scripts/seed_demo_data.py

# Start Backend Server
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### Step 2: Frontend Setup
```bash
# In another terminal
npm install --prefix frontend
npm run dev --prefix frontend
```
Application UI: `http://localhost:5173`

---

## 2. Docker Compose Deployment

To launch the full production-ready stack (Nginx, React Frontend, FastAPI Backend, PostgreSQL 16, Redis):
```bash
docker-compose up --build -d
```
- Web Application: `http://localhost`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 3. Running Automated Tests

```bash
# Backend pytest suite (10 tests)
backend/.venv/Scripts/pytest.exe backend/tests/

# Frontend vitest suite (3 tests)
npm run test --prefix frontend

# Frontend build verification
npm run build --prefix frontend
```
