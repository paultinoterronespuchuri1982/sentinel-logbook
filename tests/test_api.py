import json
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def sample_request(language="en"):
    return {"logs": client.post("/api/sample-logs").json(), "language": language}


def test_health_reports_missing_key_when_unset(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["claude_api"] == "missing"


def test_generate_report_rejects_unsupported_language(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key-not-real")

    response = client.post("/api/generate-report", json=sample_request(language="fr"))

    # Rejected before any model call, so no fake client is needed here.
    assert response.status_code == 400
    assert "en' or 'pt" in response.json()["detail"]


def test_generate_report_parses_fenced_json_reply(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key-not-real")
    reply = {
        "executive_summary": "Normal operations.",
        "equipment_status": "All nominal.",
        "incident_analysis": "None.",
        "maintenance_review": "Routine.",
        "compliance_checklist": ["Item 1", "Item 2"],
        "recommendations": "Keep monitoring.",
        "sign_off_template": "Prepared by: _____ Date: _____ Signature: _____",
    }
    fenced = "```json\n" + json.dumps(reply) + "\n```"

    class FakeMessages:
        def create(self, **kwargs):
            return SimpleNamespace(content=[SimpleNamespace(text=fenced)])

    fake_client = SimpleNamespace(messages=FakeMessages())
    monkeypatch.setattr(main, "client", fake_client)

    response = client.post("/api/generate-report", json=sample_request())

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["vessel_name"] == "FPSO Santos"
    assert body["report"]["executive_summary"] == "Normal operations."
    assert body["report"]["compliance_checklist"] == ["Item 1", "Item 2"]
