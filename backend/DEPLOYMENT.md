# Deploying the Delivery Intelligence API

The image already satisfies free-tier platform conventions: it binds
`0.0.0.0`, listens on `$PORT` (falling back to 8000 for docker compose), and
exposes `GET /health` for health checks. The service boots **without** a
trained model — `/optimize-route` works immediately, ETA endpoints return 503
until `eta_model.joblib` is provided.

## 1. Render (free tier)

**Option A — blueprint (recommended):** this repo root contains `render.yaml`.
In Render: *New + → Blueprint → connect the repository*. It creates a Docker
web service building `backend/Dockerfile` with a `/health` check and
auto-deploy on pushes to `main`.

**Option B — manual:** *New + → Web Service → connect repo*, then:

| Setting | Value |
| --- | --- |
| Root Directory | repository root |
| Environment | Docker |
| Dockerfile Path | `backend/Dockerfile` |
| Health Check Path | `/health` |
| Instance Type | Free |

Free tier spins down after inactivity; the first request after sleep pays a
cold start of a few seconds — exactly the case the frontend's offline
fallback absorbs.

## 2. Railway (trial credits)

**Dashboard:** *New Project → Deploy from GitHub repo*. `railway.toml` at the
repo root points the builder at `backend/Dockerfile`; no other settings are
required (health check path `/health` is configured too).

**CLI:**

```bash
npm i -g @railway/cli
railway login
railway init          # in the repo root
railway up            # builds via railway.toml
railway domain        # prints the public URL
```

## 3. Serving the trained model in the cloud

`eta_model.joblib` is gitignored by design, so a fresh deploy ships the API
without it. Pick one:

1. **Route-only demo (zero setup):** deploy as-is. `/health` reports
   `model_ready: false`; the dashboard transparently uses its offline estimate
   for ETAs while real OR-Tools routing keeps working.
2. **Attach storage (Railway volume):** mount a volume at `/app/models`,
   upload `eta_model.joblib` into it, and the lazy loader picks it up without
   a redeploy. On Render free tier (no volumes), rebuild with the artifact
   copied in from private storage during the build step instead:
   `RUN curl -fsSL "$MODEL_URL" -o /app/models/eta_model.joblib` (add
   `MODEL_URL` as a secret env var).
3. **Custom path anywhere:** set `ETA_MODEL_PATH` to wherever your platform
   provides the file; nothing else changes.

## 4. Runtime environment variables

All optional — see `backend/.env.example` for the full list and defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8000` | Bind port; platforms inject their own |
| `ETA_MODEL_PATH` | `backend/models/eta_model.joblib` | Model artifact location (use absolute paths in containers) |
| `CORS_ALLOWED_ORIGINS` | `*` | Comma-separated origins allowed to call the API from a browser |

## 5. Connect the frontend

Deploy the React app (e.g. Vercel: framework *Vite*, build `npm run build`,
output `dist`) and set:

```text
VITE_AI_API_URL=https://<your-render-or-railway-host>
```

Vite bakes `VITE_*` values at **build time**, so set it in the host's project
environment settings before deploying, not after. Unset, the dev server proxies
`/ai-api` to `http://localhost:8000` for local work. Because the deployed
dashboard and API have different origins, browsers preflight every POST — that
is why `CORS_ALLOWED_ORIGINS` exists; replace `*` with your exact frontend
origin once known.

## 6. Smoke test

```bash
BASE=https://<your-host>
curl -s $BASE/health                          # {"status":"ok","model_ready":true|false,...}
curl -s -X POST $BASE/optimize-route -H 'Content-Type: application/json' \
  -d '{"depot_latitude":12.9716,"depot_longitude":77.5946,
        "stops":[{"id":"A","latitude":12.935,"longitude":77.624,"demand":1},
                 {"id":"B","latitude":12.969,"longitude":77.640,"demand":1}],
        "vehicle_capacities":[5]}'             # {"routes":[...],"total_distance_km":...}
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `model_ready: false` in `/health` | artifact not shipped (by design) | Section 3 |
| 503 on `/predict-eta` | same as above | Section 3 |
| `Failed to fetch` in browser console, no server error | CORS blocked the preflight | Set `CORS_ALLOWED_ORIGINS` to the frontend origin |
| Requests work but go to `localhost:8000` | `VITE_AI_API_URL` not set at build time | Redeploy frontend with the env var |
| Deploy "unhealthy" then restarts | health check pointed at `/` | Use `/health` |
| First request slow, rest fast | free-tier cold start | Expected; fallback keeps the UI usable |
