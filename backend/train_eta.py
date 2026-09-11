"""Train the ETA regressor from Kaggle's Food Delivery Time Prediction dataset.

Download `Food Delivery Time Prediction Case Study.csv` from
https://www.kaggle.com/datasets/gauravmalik26/food-delivery-dataset and run:
python train_eta.py --data path/to/file.csv

Artifacts written to `backend/models/` (gitignored):
  eta_model.joblib - the full sklearn Pipeline (preprocessor + XGBoost), so the
                     fitted transforms travel with the model and inference can
                     never drift from the training transforms.
  metrics.json     - evaluation metrics used to populate the root RESULTS.md.

Optionally pass --metrics-json <path> to export a copy of the metrics (for
example to a scratch file outside models/ that you diff against RESULTS.md).
"""
from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor


def haversine_km(lat1, lon1, lat2, lon2):
    dlat, dlon = np.radians(lat2 - lat1), np.radians(lon2 - lon1)
    a = np.sin(dlat / 2) ** 2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2) ** 2
    return 2 * 6371 * np.arcsin(np.sqrt(a))


def first_existing(frame: pd.DataFrame, *names: str) -> str:
    for name in names:
        if name in frame.columns:
            return name
    raise ValueError(f"Dataset is missing one of: {', '.join(names)}")


def prepare_data(raw: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    # The named Kaggle dataset sometimes varies only in whitespace/capitalisation.
    raw.columns = [column.strip() for column in raw.columns]
    target = first_existing(raw, "Time_taken(min)", "delivery_time_minutes")
    restaurant_lat = first_existing(raw, "Restaurant_latitude", "restaurant_latitude")
    restaurant_lon = first_existing(raw, "Restaurant_longitude", "restaurant_longitude")
    delivery_lat = first_existing(raw, "Delivery_location_latitude", "delivery_latitude")
    delivery_lon = first_existing(raw, "Delivery_location_longitude", "delivery_longitude")
    traffic = first_existing(raw, "Road_traffic_density", "traffic_level")
    weather = first_existing(raw, "Weatherconditions", "weather")
    multiple_deliveries = first_existing(raw, "multiple_deliveries", "stops_remaining")
    order_time = first_existing(raw, "Time_Orderd", "order_time")

    cleaned_target = raw[target].astype(str).str.extract(r"(\d+(?:\.\d+)?)")[0]
    distance = haversine_km(
        pd.to_numeric(raw[restaurant_lat], errors="coerce"), pd.to_numeric(raw[restaurant_lon], errors="coerce"),
        pd.to_numeric(raw[delivery_lat], errors="coerce"), pd.to_numeric(raw[delivery_lon], errors="coerce"),
    )
    traffic_values = raw[traffic].astype(str).str.strip().str.lower().replace({"nan": "medium"})
    traffic_values = traffic_values.replace({"low ": "low", "high ": "high", "medium ": "medium", "jam ": "jam"})
    weather_values = raw[weather].astype(str).str.replace("conditions ", "", regex=False).str.strip().str.lower()
    weather_values = weather_values.replace({"nan": "sunny", "sandstorms": "stormy"})
    hours = pd.to_datetime(raw[order_time].astype(str), format="%H:%M:%S", errors="coerce").dt.hour.fillna(12)
    festivals = raw.get("Festival", pd.Series("No", index=raw.index)).astype(str).str.strip().str.lower().eq("yes")
    frame = pd.DataFrame({
        "distance_km": distance,
        "traffic_level": traffic_values.where(traffic_values.isin(["low", "medium", "high", "jam"]), "medium"),
        "hour_of_day": hours,
        "weather": weather_values.where(weather_values.isin(["sunny", "cloudy", "fog", "stormy", "windy"]), "sunny"),
        # This public dataset lacks parcel weight; use 1kg during training and collect real weight in production.
        "package_weight_kg": 1.0,
        "stops_remaining": pd.to_numeric(raw[multiple_deliveries], errors="coerce").fillna(0),
        "is_festival": festivals,
    })
    labels = pd.to_numeric(cleaned_target, errors="coerce")
    valid = frame["distance_km"].notna() & labels.notna()
    return frame.loc[valid], labels.loc[valid]


def main() -> None:
    parser = argparse.ArgumentParser(description="Train and evaluate the delivery ETA model.")
    parser.add_argument("--data", required=True, help="Path to the downloaded Kaggle CSV")
    parser.add_argument(
        "--metrics-json",
        type=Path,
        default=None,
        help="Also copy the evaluation metrics JSON to this path (used to populate RESULTS.md).",
    )
    arguments = parser.parse_args()
    features, labels = prepare_data(pd.read_csv(arguments.data))
    numeric = ["distance_km", "hour_of_day", "package_weight_kg", "stops_remaining", "is_festival"]
    categorical = ["traffic_level", "weather"]
    preprocessor = ColumnTransformer([
        ("numeric", Pipeline([("impute", SimpleImputer(strategy="median"))]), numeric),
        ("categorical", Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))]), categorical),
    ])
    xgb_params = {"n_estimators": 350, "max_depth": 6, "learning_rate": 0.04, "subsample": 0.85, "colsample_bytree": 0.85, "objective": "reg:squarederror", "random_state": 42}
    model = Pipeline([("preprocess", preprocessor), ("model", XGBRegressor(**xgb_params))])
    x_train, x_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
    started_at = time.perf_counter()
    model.fit(x_train, y_train)
    training_seconds = round(time.perf_counter() - started_at, 1)
    predictions = model.predict(x_test)
    metrics = {"mae_minutes": round(mean_absolute_error(y_test, predictions), 3), "rmse_minutes": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 3), "r2": round(r2_score(y_test, predictions), 3), "training_rows": int(len(x_train)), "test_rows": int(len(x_test)), "dataset": "Kaggle Food Delivery Time Prediction Case Study", "model": "XGBoostRegressor", "hyperparameters": xgb_params, "training_seconds": training_seconds, "trained_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    output_directory = Path(__file__).parent / "models"
    output_directory.mkdir(exist_ok=True)
    model_path = output_directory / "eta_model.joblib"
    metrics_path = output_directory / "metrics.json"
    metrics_json = json.dumps(metrics, indent=2)
    joblib.dump(model, model_path)
    metrics_path.write_text(metrics_json, encoding="utf-8")
    if arguments.metrics_json:
        arguments.metrics_json.parent.mkdir(parents=True, exist_ok=True)
        arguments.metrics_json.write_text(metrics_json, encoding="utf-8")
    print(metrics_json)
    print(f"\nETA model evaluation - {metrics['test_rows']} held-out test rows")
    print(f"  MAE : {metrics['mae_minutes']:.3f} minutes (mean absolute error)")
    print(f"  RMSE: {metrics['rmse_minutes']:.3f} minutes (penalises large misses)")
    print(f"  R2  : {metrics['r2']:.3f} (share of delivery-time variance explained)")
    print("\nArtifacts saved:")
    print(f"  model (pipeline incl. fitted preprocessor): {model_path}")
    print(f"  metrics                                     : {metrics_path}")
    if arguments.metrics_json:
        print(f"  metrics copy                                : {arguments.metrics_json}")
    print("\nNext: copy the three metrics into RESULTS.md (root) so the repository records them.")


if __name__ == "__main__":
    main()
