"""Contract tests for the Delivery Intelligence API (no dataset or model needed)."""
from __future__ import annotations

import pytest

import main

ETA_SAMPLE = {
    "distance_km": 5.0,
    "traffic_level": "high",
    "hour_of_day": 19,
    "weather": "cloudy",
    "package_weight_kg": 2.5,
    "stops_remaining": 3,
    "is_festival": False,
}

DEPOT = {"depot_latitude": 12.9716, "depot_longitude": 77.5946}


def route_payload(stop_count=5, capacity=None):
    stops = [
        {"id": f"S{index}", "latitude": 12.97 + index * 0.01, "longitude": 77.59 + index * 0.012, "demand": 1}
        for index in range(1, stop_count + 1)
    ]
    return {**DEPOT, "stops": stops, "vehicle_capacities": [capacity if capacity is not None else stop_count]}


class TestHealth:
    def test_returns_200_with_schema(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ok"
        assert isinstance(body["model_ready"], bool)
        assert isinstance(body["model_version"], str)

    def test_model_ready_tracks_artifact(self, client, model_path):
        assert client.get("/health").json()["model_ready"] is False
        model_path.touch()
        assert client.get("/health").json()["model_ready"] is True


class TestPredictEta:
    def test_valid_request_returns_prediction_json(self, client):
        response = client.post("/predict-eta", json=ETA_SAMPLE)
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("application/json")
        body = response.json()
        assert set(body) == {"predicted_eta_minutes", "model_version"}
        assert isinstance(body["predicted_eta_minutes"], float)
        # Stub model: 20 + 3 * distance_km -> 35.0 for a 5 km trip.
        assert body["predicted_eta_minutes"] == pytest.approx(35.0)

    def test_predictions_are_clamped_to_a_one_minute_floor(self, client, monkeypatch):
        class NegativeModel:
            def predict(self, frame):
                return [-40.0] * len(frame)

        monkeypatch.setattr(main, "load_model", lambda: NegativeModel())
        body = client.post("/predict-eta", json={**ETA_SAMPLE, "distance_km": 0.4}).json()
        assert body["predicted_eta_minutes"] == 1.0

    @pytest.mark.parametrize(
        "invalid_field",
        [
            {"distance_km": 0},
            {"distance_km": -2},
            {"distance_km": 501},
            {"traffic_level": "rush_hour"},
            {"weather": "snowy"},
            {"hour_of_day": 24},
            {"hour_of_day": -1},
            {"package_weight_kg": 0},
            {"stops_remaining": -2},
        ],
    )
    def test_invalid_requests_return_validation_error(self, client, invalid_field):
        response = client.post("/predict-eta", json={**ETA_SAMPLE, **invalid_field})
        assert response.status_code == 422
        detail = response.json()["detail"]
        assert isinstance(detail, list) and detail
        assert {"loc", "msg", "type"} <= set(detail[0])

    def test_missing_required_field_is_rejected(self, client):
        payload = {key: value for key, value in ETA_SAMPLE.items() if key != "distance_km"}
        assert client.post("/predict-eta", json=payload).status_code == 422

    def test_missing_model_degrades_to_503(self, client_without_model):
        response = client_without_model.post("/predict-eta", json=ETA_SAMPLE)
        assert response.status_code == 503
        assert "train_eta.py" in response.json()["detail"]


class TestBatchEta:
    def test_batch_returns_one_prediction_per_delivery(self, client):
        deliveries = [{**ETA_SAMPLE, "distance_km": distance} for distance in (1.0, 2.0, 3.0)]
        body = client.post("/predict-etas", json={"deliveries": deliveries}).json()
        assert set(body) == {"predictions", "model_version"}
        assert body["predictions"] == [pytest.approx(23.0), pytest.approx(26.0), pytest.approx(29.0)]

    def test_empty_batch_is_rejected(self, client):
        assert client.post("/predict-etas", json={"deliveries": []}).status_code == 422

    def test_oversized_batch_is_rejected(self, client):
        payload = {"deliveries": [ETA_SAMPLE] * 251}
        assert client.post("/predict-etas", json=payload).status_code == 422


class TestOptimizeRoute:
    def test_returns_valid_optimized_route(self, client):
        response = client.post("/optimize-route", json=route_payload(5))
        assert response.status_code == 200
        body = response.json()
        assert set(body) == {"routes", "total_distance_km", "solver"}
        assert body["solver"] == "google-or-tools-vrp"
        assert body["total_distance_km"] > 0
        ordered_ids = [stop_id for route in body["routes"] for stop_id in route["stop_ids"]]
        assert sorted(ordered_ids) == sorted(f"S{index}" for index in range(1, 6))
        for route in body["routes"]:
            assert set(route) == {"vehicle", "stop_ids", "distance_km"}
            assert isinstance(route["vehicle"], int)
            assert isinstance(route["distance_km"], (int, float))

    def test_single_stop_edge_case(self, client):
        body = client.post("/optimize-route", json=route_payload(1)).json()
        assert body["routes"][0]["stop_ids"] == ["S1"]
        assert body["total_distance_km"] > 0

    def test_multiple_vehicles_split_the_stops(self, client):
        payload = {**route_payload(6), "vehicle_capacities": [3, 3]}
        body = client.post("/optimize-route", json=payload).json()
        served = [stop_id for route in body["routes"] for stop_id in route["stop_ids"]]
        assert sorted(served) == sorted(f"S{index}" for index in range(1, 7))
        assert all(len(route["stop_ids"]) <= 3 for route in body["routes"])

    def test_empty_stops_list_is_rejected(self, client):
        assert client.post("/optimize-route", json={**DEPOT, "stops": [], "vehicle_capacities": [1]}).status_code == 422

    @pytest.mark.parametrize(
        "invalid_payload",
        [
            {**DEPOT, "stops": [{"id": "A", "latitude": 999, "longitude": 0, "demand": 1}], "vehicle_capacities": [1]},
            {**DEPOT, "stops": [{"id": "A", "latitude": 12.9, "longitude": 77.5, "demand": 1}], "vehicle_capacities": [0]},
        ],
    )
    def test_invalid_route_requests_are_rejected(self, client, invalid_payload):
        assert client.post("/optimize-route", json=invalid_payload).status_code == 422

    def test_infeasible_capacity_returns_422(self, client):
        response = client.post("/optimize-route", json=route_payload(5, capacity=2))
        assert response.status_code == 422
        assert "feasible" in response.json()["detail"].lower()


class TestOpenApi:
    def test_all_endpoints_are_documented(self, client):
        schema = client.get("/openapi.json").json()
        assert {"/health", "/predict-eta", "/predict-etas", "/optimize-route"} <= set(schema["paths"])
