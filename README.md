# AI-Powered Last-Mile Delivery Optimizer

An operations dashboard for last-mile delivery teams. The existing React interface, Supabase integration, maps, alerts, sustainability metrics, GPS, and offline support are preserved. The decision layer is now served by a FastAPI service:

```text
React + Vite dashboard
        │ REST
        ▼
FastAPI Delivery Intelligence API
   ├── XGBoost ETA regression model
   └── Google OR-Tools vehicle-routing solver
```

## What is genuinely AI-powered?

| Capability | Implementation | Classification |
| --- | --- | --- |
| Delivery ETA | XGBoost regression model trained on historical delivery records | Machine learning |
| Stop sequencing | Google OR-Tools capacity-constrained vehicle-routing problem solver | Operations research / optimization |
| Risk badges, festival and emergency modes | Existing application business rules | Business logic, not ML |

This distinction is deliberate: OR-Tools produces real optimized routes, but it is not a machine-learning model.

## AI service API

The FastAPI service exposes interactive OpenAPI documentation at `http://localhost:8000/docs`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Confirms service status and model availability |
| POST | `/predict-eta` | Predicts one delivery ETA in minutes |
| POST | `/predict-etas` | Batch ETA predictions used by the dashboard |
| POST | `/optimize-route` | Solves a capacity-constrained route with OR-Tools |

`src/services/aiService.js` is the single frontend integration point. It calls the service when it is available; the original rule-based estimate remains only as an explicit offline/first-run fallback so the dashboard does not break without a network connection or a deployed model.

## Training the ETA model

The training process uses the public [Food Delivery Time Prediction Case Study dataset](https://www.kaggle.com/datasets/gauravmalik26/food-delivery-dataset). Download its CSV locally; Kaggle requires that step so credentials are never committed to this repository. With the Kaggle CLI:

```bash
pip install kaggle
kaggle datasets download -d gauravmalik26/food-delivery-dataset --unzip
```

Then train and evaluate:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate
pip install -r requirements.txt
python train_eta.py --data "path/to/Food Delivery Time Prediction Case Study.csv"
```

Artifacts are written to `backend/models/`:

- `eta_model.joblib` — the full sklearn Pipeline (fitted preprocessor + XGBoost), so serving always uses the training-time transforms.
- `metrics.json` — held-out MAE, RMSE, R², split sizes, hyperparameters and a UTC training timestamp, printed at the end of the run.

Pass `--metrics-json <path>` to also export the metrics JSON somewhere convenient for updating [`RESULTS.md`](RESULTS.md). Trained models stay **gitignored on purpose**: the artifact is large, regenerated deterministically (`random_state=42`), and derived from a third-party dataset we cannot redistribute — but the evaluation numbers themselves are committed in `RESULTS.md` for reproducibility.

Features: route distance, traffic level, order hour, weather, number of remaining deliveries, festival indicator, and package weight. The cited dataset does not include parcel weight, so training uses a neutral 1 kg default for that feature; production data should replace it with observed weights before retraining.

## Model evaluation

The final report in `RESULTS.md` (populated from `metrics.json`) uses three standard regression metrics, computed only on the held-out 20% test set:

- **MAE (mean absolute error)** — average minutes the prediction misses by; the most intuitive "typical error" for dispatchers (e.g. MAE 7 ⇒ ETAs are usually ±7 min off).
- **RMSE (root mean squared error)** — also in minutes, but errors are squared first, so rare large misses dominate. A much larger RMSE than MAE signals a weak tail (jams, storms) even when the average looks good.
- **R² (coefficient of determination)** — share of delivery-time variance explained beyond always predicting the average: 1 is perfect, 0 means "no better than the mean", negative means worse than the mean.

See [`INTERVIEW_NOTES.md`](INTERVIEW_NOTES.md) for the design rationale behind every layer of the stack.

## Running tests

The pytest suite exercises the FastAPI contract without the Kaggle dataset: predictions run against a deterministic stub model, and route optimization uses the real OR-Tools solver.

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest            # 26 tests: health, ETA, validation errors, routes, edge cases
ruff check .      # lint (also enforced in CI)
```

CI runs the same lint + test gate on every push/PR touching `backend/` via [`.github/workflows/backend.yml`](.github/workflows/backend.yml).

## Run locally

Terminal 1 — API:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 — dashboard:

```bash
npm install
npm run dev
```

Vite proxies `/ai-api` to the local FastAPI service. For a deployed service, create `.env.local` in the frontend root (see `.env.example`):

```text
VITE_AI_API_URL=https://your-api.example.com
```

Backend runtime settings (port, model location, allowed CORS origins) are documented in `backend/.env.example`.

## Deployment

The backend ships as one container image that satisfies Render and Railway free-tier conventions (binds `0.0.0.0`, honours `$PORT`, `/health` check). Full walkthrough — including how the gitignored model artifact reaches the cloud — lives in [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md).

**Docker (local / any host):**

```bash
docker compose up --build
```

The compose setup mounts `backend/models` so the trained artifact is available to the container.

**Render:** push [`render.yaml`](render.yaml) contents via *New + → Blueprint* (already in this repo root). **Railway:** `railway up` with [`railway.toml`](railway.toml) at the root, or connect the repo in the dashboard.

Then deploy the frontend (e.g. Vercel, framework *Vite*, output `dist`) with `VITE_AI_API_URL` set to the API origin **at build time**, and set `CORS_ALLOWED_ORIGINS` on the API to the frontend origin so browsers may call it cross-origin. Without a deployed model the service still runs: `/health` reports `model_ready: false`, `/optimize-route` works, and the dashboard falls back to its offline ETA — by design.

## Existing dashboard features

- Supabase-compatible optimized-order persistence
- Map and GPS tracking
- Offline cached delivery data
- Emergency and festival business modes
- Delay and risk monitoring
- Sustainability metrics and delivery consolidation
- Mobile-friendly delivery agent view

## Future improvements

- Train on the organisation's historical order, driver, weather, and travel-time records.
- Use a road-network travel-time matrix instead of straight-line distance in the OR-Tools solver.
- Store predictions and actual completion times for monitoring MAE and retraining triggers.
- Add multiple depots, driver shifts, time windows, vehicle capacities, and live traffic.

## Project structure

```text
.github/workflows/backend.yml   # CI: ruff + pytest on backend changes
backend/
  main.py          # FastAPI schemas, XGBoost inference and OR-Tools API
  train_eta.py     # Reproducible training/evaluation pipeline
  tests/test_main.py  # API contract tests (stubbed model, no dataset needed)
  pytest.ini       # Test discovery + import path
  requirements.txt / requirements-dev.txt
  Dockerfile / DEPLOYMENT.md / .env.example
  models/          # Generated local model and evaluation metrics (gitignored)
src/services/aiService.js  # Minimal React-to-API adapter
RESULTS.md         # Committed training/evaluation record (populated per run)
INTERVIEW_NOTES.md # Design rationale and Q&A for reviewers
render.yaml / railway.toml   # Free-tier platform deploy configs
.env.example       # Frontend environment variable template
```
