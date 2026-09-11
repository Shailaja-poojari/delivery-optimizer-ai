# 🚚 Delivery Optimizer AI

An AI-powered last-mile delivery optimization platform that combines **Machine Learning**, **Route Optimization**, and a modern **React dashboard** to help logistics teams predict delivery ETAs, optimize delivery routes, monitor fleet performance, and improve operational efficiency.

Unlike traditional dashboards, this project separates **Machine Learning**, **Optimization Algorithms**, and **Business Logic** into independent services to make the system scalable and maintainable.

---

## Architecture

```text
                 React + Vite Dashboard
                         │
                    REST API Calls
                         │
                         ▼
          FastAPI Delivery Intelligence API
          ├── XGBoost ETA Prediction Model
          ├── Google OR-Tools Route Optimizer
          └── Business Rules Engine
```

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- JavaScript
- Leaflet Maps

## Backend

- FastAPI
- Python
- Pydantic

## Machine Learning

- XGBoost
- Scikit-learn
- Pandas
- NumPy

## Route Optimization

- Google OR-Tools

## Testing

- Pytest

## CI/CD

- GitHub Actions

## Dataset

Food Delivery Time Prediction Case Study (Kaggle)

---

# Features

## Machine Learning

- ETA prediction using XGBoost Regression
- Batch ETA prediction API
- Complete preprocessing pipeline
- Model serialization using Joblib
- Reproducible training pipeline

## Route Optimization

- Vehicle Route Optimization
- Capacity-constrained routing
- Multi-stop sequencing
- Google OR-Tools integration

## Dashboard

- Real-time delivery dashboard
- Delivery agent tracking
- GPS support
- Sustainability analytics
- Delay prediction
- Emergency mode
- Festival mode
- Offline support

---

# AI vs Business Logic

| Capability | Implementation | Type |
|------------|----------------|------|
| ETA Prediction | XGBoost Regression | Machine Learning |
| Route Optimization | Google OR-Tools | Operations Research |
| Delay Alerts | Business Rules | Rule Engine |
| Emergency Mode | Business Rules | Rule Engine |
| Festival Mode | Business Rules | Rule Engine |

The project intentionally separates Machine Learning from traditional business logic. Route optimization is powered by **Google OR-Tools**, while ETA prediction uses an independently trained **XGBoost model**.

---

# Model Performance

The ETA prediction model was trained using the **Food Delivery Time Prediction Case Study** dataset from Kaggle.

### Latest Evaluation

| Metric | Score |
|---------|------:|
| MAE | **4.922 minutes** |
| RMSE | **6.254 minutes** |
| R² Score | **0.554** |

### Interpretation

- Average prediction error is approximately **4.9 minutes**.
- RMSE indicates occasional larger prediction errors while remaining stable overall.
- The model explains approximately **55%** of the variance in delivery times.

A detailed evaluation report is available in **RESULTS.md**.

---

# Screenshots

## Dashboard

![Dashboard](dashboard.jpg)

---

## Delivery Map

![Map](map-view.jpg)

---

## Delivery Agent

![Delivery Agent](DeliveryAgentApp.jpg)

---

# API Endpoints

The FastAPI backend exposes interactive API documentation at

```

http://localhost:8000/docs

```

| Method | Endpoint | Description |
|---------|-----------|------------|
| GET | /health | Service health |
| POST | /predict-eta | Predict ETA |
| POST | /predict-etas | Batch ETA Prediction |
| POST | /optimize-route | Vehicle Route Optimization |

---

# Running the Project

## Backend

```bash
cd backend

python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

## Frontend

```bash
npm install

npm run dev
```
---

# Training the ETA Model

The ETA prediction model is trained on the **Food Delivery Time Prediction Case Study** dataset from Kaggle.

Download the dataset:

```bash
pip install kaggle

kaggle datasets download -d gauravmalik26/food-delivery-dataset --unzip
```

Create a virtual environment and install dependencies:

```bash
cd backend

python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
```

Train the model:

```bash
python train_eta.py --data "/path/to/train.csv"
```

Training automatically generates:

```
backend/models/
    eta_model.joblib
    metrics.json
```

These files are intentionally excluded from Git because they are reproducible artifacts generated from a third-party dataset.

---

# Feature Engineering

The model is trained using the following features:

| Feature | Description |
|----------|-------------|
| Distance | Haversine distance between restaurant and customer |
| Traffic Level | Road traffic density |
| Weather | Delivery weather conditions |
| Hour | Time of order |
| Stops Remaining | Number of deliveries assigned |
| Festival | Festival indicator |
| Package Weight | Default 1 kg (dataset limitation) |

Preprocessing is handled inside a serialized **Scikit-Learn Pipeline**, ensuring identical transformations during both training and inference.

---

# Running Tests

The backend contains automated API tests built with **Pytest**.

Install development dependencies:

```bash
pip install -r requirements.txt -r requirements-dev.txt
```

Run tests:

```bash
pytest
```

Run linting:

```bash
ruff check .
```

The current test suite validates:

- API health endpoint
- ETA prediction
- Batch prediction
- Route optimization
- Request validation
- Edge cases
- Error handling
- OpenAPI schema

---

# Continuous Integration

GitHub Actions automatically runs on every backend push or pull request.

The pipeline executes:

- Ruff linting
- Pytest test suite

Workflow file:

```
.github/workflows/backend.yml
```

---

# Deployment

The backend includes deployment configurations for:

- Docker
- Render
- Railway

Run locally with Docker:

```bash
docker compose up --build
```

The backend automatically binds to:

```
0.0.0.0
```

and respects

```
PORT
```

environment variables for cloud deployment.

Deployment configuration files:

```
render.yaml
railway.toml
backend/DEPLOYMENT.md
```

---

# Existing Dashboard Features

- AI ETA Prediction
- Vehicle Route Optimization
- Interactive Maps
- GPS Tracking
- Smart Delay Alerts
- Delivery Risk Analysis
- Sustainability Dashboard
- Offline Support
- Delivery Agent Interface
- Supabase Integration
- Emergency Mode
- Festival Mode

---

# Project Structure

```text
.github/
└── workflows/
    └── backend.yml

backend/
├── main.py
├── train_eta.py
├── tests/
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── DEPLOYMENT.md
└── models/

src/
├── components/
├── services/
├── utils/
├── pages/
└── App.jsx

RESULTS.md
INTERVIEW_NOTES.md
render.yaml
railway.toml
docker-compose.yml
```

---

# Future Improvements

- Train on proprietary logistics datasets
- Live traffic integration
- Driver behavior modeling
- Multiple depots
- Time-window constrained routing
- Dynamic fleet assignment
- Real-time ETA retraining
- Model monitoring dashboard
- Prediction drift detection
- Live GPS travel-time estimation

---

# Why This Project?

This project demonstrates how modern logistics software combines **Machine Learning**, **Optimization Algorithms**, and **Backend Engineering** into a production-style application.

Key engineering highlights include:

- End-to-end ML pipeline using XGBoost
- FastAPI REST backend
- Google OR-Tools optimization
- Automated testing with Pytest
- CI using GitHub Actions
- Reproducible model training
- Clean architecture separating AI, optimization, and business logic
- Offline-first frontend design with graceful degradation

---

# License

This project is licensed under the MIT License.

---

# Author

**Shailaja Poojari**

If you found this project useful or interesting, feel free to ⭐ the repository.
