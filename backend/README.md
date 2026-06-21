# Backend

FastAPI backend with Google OAuth2 flow.

## Local Setup

```bash
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open the health endpoint after the server starts:

```bash
curl http://localhost:8000/api/health
```

## Required OAuth Environment

```text
FRONTEND_URL=http://localhost:5173
BACKEND_PUBLIC_URL=http://localhost:8000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
```

`GOOGLE_REDIRECT_URI` is optional when `BACKEND_PUBLIC_URL` is set. If provided, it overrides the generated callback URL.

For production, use the public backend and frontend URLs and add the exact callback URI to Google Cloud Console.
