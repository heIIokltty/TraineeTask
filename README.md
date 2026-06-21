# KAIROS Trainee Task

Public responsive landing page with Google OAuth2 authorization and real-time cryptocurrency prices.

## Stack

Frontend:

- Vite
- TypeScript
- Plain CSS
- Native WebSocket API

Backend:

- Python
- FastAPI
- Backend Google OAuth2 flow
- Temporary signed token for frontend auth
- No database and no server-side sessions

## Environment

Secrets are not committed. Copy examples before local development:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set real Google OAuth credentials in `backend/.env`:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
```

For local development, Google Cloud Console must allow this redirect URI:

```text
http://localhost:8000/api/auth/google/callback
```

For deployment, replace local origins with public URLs:

```text
FRONTEND_URL=https://your-frontend.example.com
BACKEND_PUBLIC_URL=https://your-backend.example.com
```

Alternatively, set `GOOGLE_REDIRECT_URI` explicitly. It must exactly match the redirect URI configured in Google Cloud Console.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/api/health
```

Google OAuth start URL:

```text
http://localhost:8000/api/auth/google/start?accountType=personal
```

This URL works only when the FastAPI server is running and OAuth environment variables are configured.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

In local development, `frontend/.env` uses `VITE_DEV_API_PROXY_TARGET` so frontend code can call relative `/api/...` URLs. For separate deployed frontend and backend domains, set:

```text
VITE_API_BASE_URL=https://your-backend.example.com
```

Build check:

```bash
npm run build
npm run preview
```

## Deployment Notes

- Never commit `backend/.env`, `frontend/.env`, or real secrets.
- Configure all public frontend origins in `FRONTEND_URL`; comma-separated values are supported.
- Configure the backend public origin through `BACKEND_PUBLIC_URL` or set the full `GOOGLE_REDIRECT_URI`.
- Ensure the production Google redirect URI is added in Google Cloud Console before testing OAuth.
