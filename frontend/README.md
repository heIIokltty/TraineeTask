# Frontend

Vite + TypeScript + plain CSS frontend.

## Local Setup

```bash
cp .env.example .env
npm install
npm run dev
```

By default the app calls relative `/api/...` paths. In development, set `VITE_DEV_API_PROXY_TARGET` in `.env` to proxy API calls to the FastAPI server.

For deployment with a separate backend domain, set:

```text
VITE_API_BASE_URL=https://your-backend.example.com
```

## Checks

```bash
npm run build
npm run preview
```
