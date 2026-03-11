# mindPalace – mp-frontend

Frontend service for mindPalace. `.env` is in the repo; clone and run.

## Clone and run

```bash
git clone <this-repo-url> . && npm install && npm run dev
```

App at http://localhost:5173 (or next free port). Backend URLs are in `.env`; edit if needed.

## Setup (optional)

Edit `.env` to set:
   - **VITE_API_URL** – Java backend (e.g. `http://localhost:5001` or `https://backendttl.onrender.com`)
   - **VITE_TTS_URL** – Node TTS server (e.g. `http://localhost:8000` or your cloud Node URL)
   - **VITE_GOOGLE_REDIRECT_URI** – must match where this app is served (e.g. `http://localhost:5173/auth/google/callback` for local dev)
   - Add any other keys (Auth0, YouTube, etc.) as needed.

## Run locally

```bash
npm install
npm run dev
```

App is at http://localhost:5173. It will call the backends configured in `.env`.

## Run with Docker

Build and run:

```bash
docker build -t mp-frontend .
docker run -p 5173:5173 --env-file .env mp-frontend
```

Or use Compose:

```bash
docker compose up --build
```

`.env` is in the repo; the container uses it for `VITE_API_URL` and `VITE_TTS_URL`.

## Connecting to local vs cloud backends

- **Local backends**: set `VITE_API_URL=http://localhost:5001` and `VITE_TTS_URL=http://localhost:8000` in `.env`.
- **Cloud backends**: set `VITE_API_URL=https://backendttl.onrender.com` (or your Java backend URL) and `VITE_TTS_URL` to your Node server URL.

The dev server proxy for `/api` uses `VITE_API_URL`, so one `.env` controls both the app and the proxy.
