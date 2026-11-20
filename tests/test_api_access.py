from fastapi.testclient import TestClient
import pytest

import main

client = TestClient(main.app)


@pytest.mark.parametrize("method,path", [
    ("GET", "/history"), ("DELETE", "/history"), ("GET", "/logs"),
    ("POST", "/chat"), ("POST", "/webhook"),
])
def test_private_routes_require_configured_credentials(monkeypatch, method, path):
    monkeypatch.delenv("DEATHCON_OPERATOR_TOKEN", raising=False)
    monkeypatch.delenv("DEATHCON_WEBHOOK_TOKEN", raising=False)
    assert client.request(method, path, json={}).status_code == 503


def test_separate_tokens_for_operator_and_ingestion(monkeypatch):
    monkeypatch.setenv("DEATHCON_OPERATOR_TOKEN", "operator-fixture")
    monkeypatch.setenv("DEATHCON_WEBHOOK_TOKEN", "ingest-fixture")
    monkeypatch.setattr(main, "webhook_logs", [])
    operator = {"Authorization": "Bearer operator-fixture"}
    ingest = {"Authorization": "Bearer ingest-fixture"}
    assert client.get("/health").status_code == 200
    assert client.get("/logs", headers=ingest).status_code == 401
    assert client.get("/logs").status_code == 401
    payload = {"source": "fixture", "data": {"status": "ok"}}
    assert client.post("/webhook", headers=operator, json=payload).status_code == 401
    assert client.post("/webhook", headers=ingest, json=payload).status_code == 200
    assert client.get("/logs", headers=operator).json()["logs"][0]["source"] == "fixture"
