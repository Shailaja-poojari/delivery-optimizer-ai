# ETA Model — Training Results

Reproducible evaluation record for the delivery ETA regression model. Model
binaries and raw `metrics.json` stay gitignored (see
[Reproducibility notes](#reproducibility-notes)); this file is the committed,
human-readable summary of the latest training run.

---

## Dataset

| | |
| --- | --- |
| Name | Food Delivery Time Prediction Case Study |
| Source | Kaggle — gauravmalik26/food-delivery-dataset |
| Training rows | **36,474** |
| Test rows | **9,119** |
| Total rows | **45,593** |
| Target | `Time_taken(min)` — actual delivery duration in minutes |
| License note | Third-party dataset; download locally with your own Kaggle credentials, never commit the CSV |

---

## Feature Summary

| Feature | Type | Derived from | Notes |
| --- | --- | --- | --- |
| `distance_km` | Numeric | Haversine distance between restaurant and delivery coordinates | Primary predictor of delivery duration |
| `traffic_level` | Categorical | `Road_traffic_density` | Encoded using one-hot encoding |
| `hour_of_day` | Numeric | `Time_Orderd` | Captures peak-hour traffic patterns |
| `weather` | Categorical | `Weatherconditions` | Encoded using one-hot encoding |
| `package_weight_kg` | Numeric | Constant | Public dataset has no package weight column; default value of **1 kg** used during training |
| `stops_remaining` | Numeric | `multiple_deliveries` | Represents batching workload |
| `is_festival` | Boolean | `Festival` | Indicates demand surges during festivals |

### Preprocessing

The model is trained using an `sklearn.Pipeline` containing:

- Median imputation for numeric features
- Most-frequent imputation for categorical features
- One-hot encoding (`handle_unknown="ignore"`)
- XGBoost regression model

Because preprocessing is part of the serialized pipeline, inference always uses
the exact same transformations as training.

---

## Train/Test Split

- **Training:** 36,474 rows (80%)
- **Testing:** 9,119 rows (20%)
- `random_state = 42`

A fixed random seed ensures reproducible experiments.

---

## Model

**Algorithm**

`XGBRegressor`

### Hyperparameters

| Parameter | Value |
| --- | ---: |
| n_estimators | 350 |
| max_depth | 6 |
| learning_rate | 0.04 |
| subsample | 0.85 |
| colsample_bytree | 0.85 |
| objective | reg:squarederror |
| random_state | 42 |

The trained pipeline is saved locally as:

```
backend/models/eta_model.joblib
```

---

# Model Evaluation (Held-out Test Set)

| Metric | Value | Interpretation |
| --- | ---: | --- |
| **MAE** | **4.922 minutes** | On average, ETA predictions differ from the actual delivery time by approximately **4.9 minutes**. |
| **RMSE** | **6.254 minutes** | Larger errors are penalized more heavily. The moderate gap between RMSE and MAE indicates occasional larger prediction errors but overall stable performance. |
| **R² Score** | **0.554** | The model explains approximately **55.4%** of the variation in delivery times on unseen test data. |

## Latest Training Run

```text
MAE : 4.922 minutes
RMSE: 6.254 minutes
R²  : 0.554

Training rows : 36,474
Test rows     : 9,119

Training time : 2.7 seconds

Model         : XGBoostRegressor

Dataset       : Food Delivery Time Prediction Case Study

Training date : 2026-09-11T13:15:31+00:00
```

---

# Interpretation

### Mean Absolute Error (MAE)

The model's predictions are typically within **±4.9 minutes** of the true delivery
time. This represents the expected prediction error for a normal delivery.

### Root Mean Squared Error (RMSE)

The RMSE of **6.254 minutes** indicates that larger prediction mistakes occur
occasionally but are not dominant. Since RMSE is only moderately higher than
MAE, the model does not suffer from excessive extreme outliers.

### R² Score

An **R² of 0.554** means the model explains approximately **55%** of the
variation in delivery time using the available features. While not perfect,
this is a reasonable result for a public delivery dataset that lacks several
real-world operational variables such as driver experience, live GPS traffic,
road closures, and package characteristics.

---

# How to Reproduce

```bash
cd backend

python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt

python train_eta.py --data "/path/to/train.csv"
```

Training automatically produces:

```
backend/models/
    eta_model.joblib
    metrics.json
```

Update this document whenever the model is retrained.

---

# Reproducibility Notes

- Model binaries (`backend/models/*.joblib`) are intentionally gitignored because they are generated artifacts derived from a third-party Kaggle dataset.
- `metrics.json` is also gitignored because it is regenerated during every training run.
- This `RESULTS.md` file is intentionally committed to provide a reproducible record of the latest evaluation metrics without requiring reviewers to download the dataset.
- Using `random_state=42` ensures consistent train/test splits and comparable results across retraining runs.

---

## Summary

- Dataset: Food Delivery Time Prediction Case Study
- Algorithm: XGBoost Regressor
- Training Samples: **36,474**
- Test Samples: **9,119**
- MAE: **4.922 minutes**
- RMSE: **6.254 minutes**
- R² Score: **0.554**
- Training Time: **2.7 seconds**
- Training Date (UTC): **2026-09-11T13:15:31+00:00**