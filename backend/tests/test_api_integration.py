"""End-to-end integration and security isolation tests for all Accora API endpoints."""

import os
import tempfile
from datetime import date
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import init_db
from app.main import app


@pytest.fixture(scope="module")
def test_client():
    # Use temporary SQLite database to avoid touching active database
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    orig_db = settings.database_path
    settings.database_path = temp_db
    init_db(temp_db)

    with TestClient(app) as client:
        yield client

    settings.database_path = orig_db
    try:
        os.remove(temp_db)
    except Exception:
        pass


def test_unauthenticated_requests_are_rejected(test_client):
    """Protected endpoints must return 401 when no token is supplied."""
    endpoints = [
        ("GET", "/api/v1/business"),
        ("GET", "/api/v1/transactions"),
        ("POST", "/api/v1/transactions"),
        ("GET", "/api/v1/invoices"),
        ("GET", "/api/v1/metrics"),
        ("GET", "/api/v1/health"),
        ("GET", "/api/v1/cashflow"),
        ("GET", "/api/v1/forecast"),
        ("GET", "/api/v1/reports/pnl"),
        ("GET", "/api/v1/settings"),
    ]
    for method, path in endpoints:
        resp = test_client.request(method, path)
        assert resp.status_code == 401, f"{method} {path} should require authentication, got {resp.status_code}"


def test_auth_and_isolated_workspaces_crud(test_client):
    """Verify two distinct users get completely isolated workspaces and cannot cross-access data."""
    # User 1 Signup
    resp1 = test_client.post(
        "/api/v1/auth/signup",
        json={"name": "Alice Corp", "email": "alice@corp.test", "password": "Password123!"},
    )
    assert resp1.status_code == 201
    token1 = resp1.json()["token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # User 2 Signup
    resp2 = test_client.post(
        "/api/v1/auth/signup",
        json={"name": "Bob LLC", "email": "bob@llc.test", "password": "Password123!"},
    )
    assert resp2.status_code == 201
    token2 = resp2.json()["token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Alice creates a transaction
    t_resp = test_client.post(
        "/api/v1/transactions",
        headers=headers1,
        json={
            "date": "2026-05-01",
            "description": "Alice Client Retainer",
            "category": "Client Retainer",
            "type": "income",
            "amount": 75000.0,
            "status": "completed",
            "notes": "Private note for Alice",
        },
    )
    assert t_resp.status_code == 201
    alice_txn = t_resp.json()
    alice_txn_id = alice_txn["id"]

    # Bob lists transactions — should NOT see Alice's transaction
    bob_txns = test_client.get("/api/v1/transactions", headers=headers2).json()
    assert len(bob_txns) == 0

    # Bob directly attempts to GET, UPDATE, or DELETE Alice's transaction
    del_resp = test_client.delete(f"/api/v1/transactions/{alice_txn_id}", headers=headers2)
    assert del_resp.status_code == 404  # Not found in Bob's workspace

    put_resp = test_client.put(
        f"/api/v1/transactions/{alice_txn_id}",
        headers=headers2,
        json={"amount": 999999.0},
    )
    assert put_resp.status_code == 404

    # Alice creates an invoice
    inv_resp = test_client.post(
        "/api/v1/invoices",
        headers=headers1,
        json={
            "client_name": "Acme Global",
            "client_email": "billing@acme.test",
            "items": [{"description": "Design Consultation", "quantity": 1, "unit_price": 50000.0, "amount": 50000.0}],
            "tax_rate": 5.0,
            "status": "sent",
            "issue_date": "2026-05-02",
            "due_date": "2026-06-02",
        },
    )
    assert inv_resp.status_code == 201
    alice_inv_id = inv_resp.json()["id"]

    # Bob lists invoices — should see 0
    bob_invs = test_client.get("/api/v1/invoices", headers=headers2).json()
    assert len(bob_invs) == 0

    # Bob directly attempts to delete Alice's invoice
    inv_del_resp = test_client.delete(f"/api/v1/invoices/{alice_inv_id}", headers=headers2)
    assert inv_del_resp.status_code == 404


def test_ai_copilot_and_insights_endpoints(test_client):
    """Verify AI endpoints respond safely and return valid structures."""
    # Login demo
    login_resp = test_client.post("/api/v1/auth/demo-login")
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # AI Chat
    chat_resp = test_client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={"message": "What is our current cash runway?", "history": []},
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "answer" in chat_data
    assert len(chat_data["answer"]) > 0

    # AI Insights
    insights_resp = test_client.get("/api/v1/ai/insights", headers=headers)
    assert insights_resp.status_code == 200
    insights = insights_resp.json()
    assert isinstance(insights, list)

    # What-If Simulator
    whatif_resp = test_client.post(
        "/api/v1/ai/what-if",
        headers=headers,
        json={
            "scenario_type": "hire",
            "description": "Hire a full-time senior designer",
            "params": {"monthly_cost": 50000},
        },
    )
    assert whatif_resp.status_code == 200
    whatif_data = whatif_resp.json()
    assert "projected_profit" in whatif_data
    assert "ai_interpretation" in whatif_data
