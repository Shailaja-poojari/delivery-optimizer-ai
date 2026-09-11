"""Shared fixtures for API tests.

The trained XGBoost artifact and the Kaggle dataset are never needed: the model
is stubbed with a deterministic stand-in and the model path points at a tmp dir,
so the suite is hermetic and CI-friendly.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient

# Allow `import main` regardless of where pytest is invoked from.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main  # noqa: E402


class StubETAModel:
    """Mimics the serialized pipeline contract: DataFrame in, minutes out."""

    def predict(self, frame):
        return 20.0 + 3.0 * np.asarray(frame["distance_km"], dtype=float)


@pytest.fixture()
def model_path(tmp_path, monkeypatch) -> Path:
    """Isolate the model location per test (mirrors the ETA_MODEL_PATH override)."""
    path = tmp_path / "eta_model.joblib"
    monkeypatch.setattr(main, "MODEL_PATH", path)
    return path


@pytest.fixture()
def client(model_path, monkeypatch) -> TestClient:
    monkeypatch.setattr(main, "load_model", lambda: StubETAModel())
    return TestClient(main.app)


@pytest.fixture()
def client_without_model(model_path) -> TestClient:
    """Real load_model() with no artifact on disk, to assert graceful degradation."""
    return TestClient(main.app)
