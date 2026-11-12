
from fastapi.testclient import TestClient

import app.main as main_module


client = TestClient(main_module.app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to MeetGraph AI API"


def test_health_endpoint_with_database(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "check_database_connection",
        lambda: True,
    )

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["services"]["postgresql"] == "connected"


def test_health_endpoint_without_database(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "check_database_connection",
        lambda: False,
    )

    response = client.get("/api/v1/health")

    assert response.status_code == 503
    assert response.json()["status"] == "degraded"
    assert response.json()["services"]["postgresql"] == "disconnected"
