"""HTTP service for the trained ETA estimator and OR-Tools route solver."""
from __future__ import annotations

import os
from math import asin, cos, radians, sin, sqrt
from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from pydantic import BaseModel, Field, field_validator

# Defaults keep local development and docker compose unchanged; the environment
# variables only matter when the service is deployed (see backend/DEPLOYMENT.md).
MODEL_PATH = Path(os.getenv("ETA_MODEL_PATH") or Path(__file__).parent / "models" / "eta_model.joblib")
app = FastAPI(title="Delivery Intelligence API", version="1.0.0")

# Browsers call the API directly when the frontend is deployed on a different
# origin (e.g. Vercel dashboard -> Render API). Demo default is open; lock it
# down with CORS_ALLOWED_ORIGINS="https://your-dashboard.example.com".
_cors_origins = [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",") if origin.strip()] or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    # Credentials are incompatible with a wildcard origin and unused by this API.
    allow_credentials="*" not in _cors_origins,
)


class ETARequest(BaseModel):
    distance_km: float = Field(gt=0, le=500)
    traffic_level: Literal["low", "medium", "high", "jam"] = "medium"
    hour_of_day: int = Field(ge=0, le=23)
    weather: Literal["sunny", "cloudy", "fog", "stormy", "windy"] = "sunny"
    package_weight_kg: float = Field(default=1, gt=0, le=100)
    stops_remaining: int = Field(default=0, ge=0, le=100)
    is_festival: bool = False


class BatchETARequest(BaseModel):
    deliveries: list[ETARequest] = Field(min_length=1, max_length=250)


class Stop(BaseModel):
    id: str | int
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    demand: int = Field(default=1, ge=0)


class RouteRequest(BaseModel):
    depot_latitude: float = Field(ge=-90, le=90)
    depot_longitude: float = Field(ge=-180, le=180)
    stops: list[Stop] = Field(min_length=1, max_length=100)
    vehicle_capacities: list[int] = Field(default=[100], min_length=1, max_length=20)

    @field_validator("vehicle_capacities")
    @classmethod
    def positive_capacities(cls, values: list[int]) -> list[int]:
        if any(value < 1 for value in values):
            raise ValueError("vehicle capacities must be positive")
        return values


def load_model():
    if not MODEL_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="ETA model is not installed. Run train_eta.py before serving predictions.",
        )
    return joblib.load(MODEL_PATH)


def predict(deliveries: list[ETARequest]) -> list[float]:
    model = load_model()
    frame = pd.DataFrame([delivery.model_dump() for delivery in deliveries])
    values = model.predict(frame)
    return [round(max(float(value), 1.0), 1) for value in values]


def haversine_meters(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> int:
    lat_delta, lon_delta = radians(b_lat - a_lat), radians(b_lon - a_lon)
    h = sin(lat_delta / 2) ** 2 + cos(radians(a_lat)) * cos(radians(b_lat)) * sin(lon_delta / 2) ** 2
    return int(2 * 6_371_000 * asin(sqrt(h)))


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model_ready": MODEL_PATH.exists(), "model_version": "xgboost-eta-v1"}


@app.post("/predict-eta")
def predict_eta(request: ETARequest) -> dict:
    return {"predicted_eta_minutes": predict([request])[0], "model_version": "xgboost-eta-v1"}


@app.post("/predict-etas")
def predict_etas(request: BatchETARequest) -> dict:
    return {"predictions": predict(request.deliveries), "model_version": "xgboost-eta-v1"}


@app.post("/optimize-route")
def optimize_route(request: RouteRequest) -> dict:
    locations = [(request.depot_latitude, request.depot_longitude)] + [
        (stop.latitude, stop.longitude) for stop in request.stops
    ]
    matrix = [[haversine_meters(*source, *target) for target in locations] for source in locations]
    manager = pywrapcp.RoutingIndexManager(len(locations), len(request.vehicle_capacities), 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    distance_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(distance_callback_index)

    def demand_callback(from_index):
        return 0 if manager.IndexToNode(from_index) == 0 else request.stops[manager.IndexToNode(from_index) - 1].demand

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(demand_callback_index, 0, request.vehicle_capacities, True, "Capacity")
    parameters = pywrapcp.DefaultRoutingSearchParameters()
    parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    parameters.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    parameters.time_limit.FromSeconds(2)
    solution = routing.SolveWithParameters(parameters)
    if not solution:
        raise HTTPException(status_code=422, detail="No feasible route was found for the supplied capacities.")

    routes, total_distance_meters = [], 0
    for vehicle_index in range(len(request.vehicle_capacities)):
        index, route, route_distance = routing.Start(vehicle_index), [], 0
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node:
                route.append(request.stops[node - 1].id)
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_index)
        total_distance_meters += route_distance
        if route:
            routes.append({"vehicle": vehicle_index + 1, "stop_ids": route, "distance_km": round(route_distance / 1000, 2)})
    return {"routes": routes, "total_distance_km": round(total_distance_meters / 1000, 2), "solver": "google-or-tools-vrp"}
