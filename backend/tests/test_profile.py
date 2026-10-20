"""Tests for business profile persistence, financial calculations, data import, and multi-user isolation."""

import os
import tempfile
from datetime import date
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import init_db
from app.core.rate_limit import auth_rate_limiter
from app.main import app
from app.models.financial import TransactionType, TransactionStatus


@pytest.fixture(autouse=True)
def reset_rate_limits():
    auth_rate_limiter.reset()
    yield
    auth_rate_limiter.reset()


@pytest.fixture(scope="module")
def test_client():
    # Use an isolated temp db for testing
    temp_dir = tempfile.mkdtemp()
    temp_db = os.path.join(temp_dir, "test_profile.db")
    settings.database_path = temp_db

    init_db(temp_db)
    with TestClient(app) as client:
        yield client, temp_db


def test_business_profile_update_and_persistence(test_client):
    client, _ = test_client

    # 1. Register a new user
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "David Miller",
            "email": "david.miller@acmetech.io",
            "password": "SecurePassword2026!",
            "confirm_password": "SecurePassword2026!",
        },
    )
    assert signup_resp.status_code == 201
    token = signup_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get initial business profile
    get_biz = client.get("/api/v1/business", headers=headers)
    assert get_biz.status_code == 200
    biz_data = get_biz.json()
    assert biz_data["name"] == "David Miller's Business"
    assert biz_data["opening_cash_balance"] == 0.0

    # 3. Update business profile with comprehensive financial setup
    update_payload = {
        "name": "Acme Cloud Solutions",
        "industry": "Cloud Software",
        "business_type": "SaaS",
        "country": "US",
        "currency": "USD",
        "fiscal_year_start": "January",
        "business_start_date": "2024-01-15",
        "employee_count": 5,
        "opening_cash_balance": 125000.0,
        "avg_monthly_revenue": 45000.0,
        "monthly_fixed_expenses": 20000.0,
        "monthly_variable_expenses": 8000.0,
        "outstanding_ar": 15000.0,
        "outstanding_ap": 6000.0,
        "loan_balance": 50000.0,
        "monthly_loan_repayment": 2500.0,
        "expected_growth_rate": 18.5,
        "financial_goals": "Scale ARR to $750k and reach positive operating cash flow.",
        "onboarding_completed": True,
    }
    put_biz = client.put("/api/v1/business", json=update_payload, headers=headers)
    assert put_biz.status_code == 200
    updated_biz = put_biz.json()
    assert updated_biz["name"] == "Acme Cloud Solutions"
    assert updated_biz["opening_cash_balance"] == 125000.0
    assert updated_biz["monthly_loan_repayment"] == 2500.0
    assert updated_biz["onboarding_completed"] is True

    # 4. Verify baseline metrics are calculated from setup values without fake transactions
    metrics_resp = client.get("/api/v1/metrics", headers=headers)
    assert metrics_resp.status_code == 200
    metrics = metrics_resp.json()
    assert len(metrics) == 1
    m0 = metrics[0]
    assert m0["is_estimated"] is True
    assert m0["revenue"] == 45000.0
    assert m0["expenses"] == 28000.0  # 20000 fixed + 8000 variable
    assert m0["profit"] == 17000.0  # Accounting Profit: 45000 - 28000
    assert m0["operating_cash_flow"] == 17000.0
    assert m0["financing_cash_flow"] == -2500.0  # Loan debt service
    assert m0["cash_flow"] == 14500.0  # Net Cash Flow: 17000 - 2500
    assert m0["cash_balance"] == 139500.0  # Opening 125000 + 14500 net cf


def test_batch_transaction_import_and_duplicate_detection(test_client):
    client, _ = test_client

    # Register user
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Elena Rostova",
            "email": "elena@vanguard.de",
            "password": "SecurePassword2026!",
            "confirm_password": "SecurePassword2026!",
        },
    )
    assert signup_resp.status_code == 201
    token = signup_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set opening balance to 50,000
    client.put("/api/v1/business", json={"opening_cash_balance": 50000.0, "currency": "EUR"}, headers=headers)

    # Batch import 3 transactions
    batch_payload = {
        "skip_duplicates": True,
        "transactions": [
            {
                "date": "2026-03-01",
                "description": "Enterprise License Client A",
                "category": "Subscriptions",
                "type": "income",
                "amount": 10000.0,
                "status": "completed",
                "notes": "Annual plan",
            },
            {
                "date": "2026-03-05",
                "description": "AWS Hosting Infrastructure",
                "category": "Cloud Services",
                "type": "expense",
                "amount": 2500.0,
                "status": "completed",
                "notes": "Production cluster",
            },
            {
                "date": "2026-03-10",
                "description": "Team Coworking Space",
                "category": "Office",
                "type": "expense",
                "amount": 1500.0,
                "status": "completed",
                "notes": "Munich office",
            },
        ],
    }

    import_resp = client.post("/api/v1/transactions/batch", json=batch_payload, headers=headers)
    assert import_resp.status_code == 200
    data = import_resp.json()
    assert data["imported_count"] == 3
    assert data["skipped_count"] == 0
    assert len(data["duplicates"]) == 0

    # Attempt to import again with identical rows + 1 new row
    batch_payload_with_dupes = {
        "skip_duplicates": True,
        "transactions": [
            {
                "date": "2026-03-01",
                "description": "Enterprise License Client A",
                "category": "Subscriptions",
                "type": "income",
                "amount": 10000.0,
                "status": "completed",
                "notes": "Annual plan",
            },
            {
                "date": "2026-03-15",
                "description": "Client B Consulting",
                "category": "Consulting",
                "type": "income",
                "amount": 4000.0,
                "status": "completed",
                "notes": "Advisory services",
            },
        ],
    }
    reimport_resp = client.post("/api/v1/transactions/batch", json=batch_payload_with_dupes, headers=headers)
    assert reimport_resp.status_code == 200
    reimport_data = reimport_resp.json()
    assert reimport_data["imported_count"] == 1
    assert reimport_data["skipped_count"] == 1
    assert len(reimport_data["duplicates"]) == 1

    # Verify actual metrics replaced the baseline
    metrics_resp = client.get("/api/v1/metrics", headers=headers)
    metrics = metrics_resp.json()
    assert len(metrics) == 1
    m = metrics[0]
    assert m["is_estimated"] is False
    assert m["revenue"] == 14000.0  # 10000 + 4000
    assert m["expenses"] == 4000.0  # 2500 + 1500
    assert m["profit"] == 10000.0  # 14000 - 4000
    assert m["cash_flow"] == 10000.0
    assert m["cash_balance"] == 60000.0  # 50000 opening + 10000 net cf


def test_multi_user_profile_and_financial_isolation(test_client):
    client, _ = test_client

    # User A
    user_a = client.post(
        "/api/v1/auth/signup",
        json={"name": "Alice Corp", "email": "alice@corp.com", "password": "Password123!", "confirm_password": "Password123!"},
    ).json()
    headers_a = {"Authorization": f"Bearer {user_a['token']}"}
    client.put("/api/v1/business", json={"name": "Alice Ventures", "opening_cash_balance": 88000.0}, headers=headers_a)

    # User B
    user_b = client.post(
        "/api/v1/auth/signup",
        json={"name": "Bob Ltd", "email": "bob@ltd.com", "password": "Password123!", "confirm_password": "Password123!"},
    ).json()
    headers_b = {"Authorization": f"Bearer {user_b['token']}"}
    client.put("/api/v1/business", json={"name": "Bob Logistics", "opening_cash_balance": 15000.0}, headers=headers_b)

    # Ensure Alice sees only Alice
    biz_a = client.get("/api/v1/business", headers=headers_a).json()
    assert biz_a["name"] == "Alice Ventures"
    assert biz_a["opening_cash_balance"] == 88000.0

    # Ensure Bob sees only Bob
    biz_b = client.get("/api/v1/business", headers=headers_b).json()
    assert biz_b["name"] == "Bob Logistics"
    assert biz_b["opening_cash_balance"] == 15000.0
