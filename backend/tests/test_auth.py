"""Comprehensive backend test suite for authentication, authorization, and data isolation."""

import os
import tempfile
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import (
    db_create_session,
    db_get_user_by_email,
    init_db,
)
from app.core.rate_limit import auth_rate_limiter
from app.core.security import (
    generate_salt,
    hash_password,
    validate_password_rules,
    verify_password,
)
from app.main import app


@pytest.fixture(autouse=True)
def reset_rate_limits():
    auth_rate_limiter.reset()
    yield
    auth_rate_limiter.reset()


@pytest.fixture(scope="module")
def client():
    # Use an isolated temporary database for test suite
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db_path = f.name

    orig_db = settings.database_path
    orig_demo = settings.demo_mode
    settings.database_path = test_db_path
    settings.demo_mode = True
    init_db(test_db_path, seed_demo=True)

    with TestClient(app) as test_client:
        yield test_client

    settings.database_path = orig_db
    settings.demo_mode = orig_demo
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except OSError:
            pass


def test_password_hashing_and_verification():
    """Verify PBKDF2-HMAC-SHA256 password hashing and constant-time verification."""
    raw_password = "SecurePassword2026!"
    salt1 = generate_salt()
    salt2 = generate_salt()

    assert salt1 != salt2, "Salts must be distinct and cryptographically random"

    hash1 = hash_password(raw_password, salt1)
    hash2 = hash_password(raw_password, salt2)

    assert hash1 != hash2, "Distinct salts must produce different hashes for same password"
    assert hash1 != raw_password, "Password must never be stored plain-text"

    # Constant-time verification
    assert verify_password(raw_password, salt1, hash1) is True
    assert verify_password("WrongPassword123!", salt1, hash1) is False
    assert verify_password(raw_password, salt2, hash1) is False


def test_password_complexity_rules():
    """Verify password complexity validation."""
    assert len(validate_password_rules("short1!")) > 0  # < 8 chars
    assert len(validate_password_rules("nouppercase1!")) > 0
    assert len(validate_password_rules("NOLOWERCASE1!")) > 0
    assert len(validate_password_rules("NoDigitsSpecial!")) > 0
    assert len(validate_password_rules("NoSpecial12345")) > 0
    assert len(validate_password_rules("ValidP@ssw0rd!")) == 0


def test_signup_flow(client: TestClient):
    """Test user registration with credential validation and isolated workspace creation."""
    payload = {
        "name": "Fatima Noor",
        "email": "fatima@testfintech.com",
        "password": "FatimaPass2026!",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert len(data["token"]) > 30
    assert data["user"]["name"] == "Fatima Noor"
    assert data["user"]["email"] == "fatima@testfintech.com"
    assert "business_id" in data["user"]

    # Verify plain-text password was never saved
    db_user = db_get_user_by_email("fatima@testfintech.com")
    assert db_user is not None
    assert db_user["password_hash"] != "FatimaPass2026!"
    assert verify_password("FatimaPass2026!", db_user["salt"], db_user["password_hash"])


def test_signup_duplicate_email(client: TestClient):
    """Registration with duplicate email must be rejected with 400 Bad Request."""
    payload = {
        "name": "Fatima Duplicate",
        "email": "fatima@testfintech.com",
        "password": "FatimaPass2026!",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


def test_signup_weak_password(client: TestClient):
    """Registration with weak password must be rejected with 422 (length) or 400 (complexity)."""
    # 1. Less than 8 characters -> Pydantic validator returns 422
    payload_short = {
        "name": "Weak User",
        "email": "weak1@testfintech.com",
        "password": "short",
    }
    res_short = client.post("/api/v1/auth/signup", json=payload_short)
    assert res_short.status_code == 422

    # 2. 8+ characters but missing uppercase, digits, or symbols -> returns 400 Bad Request
    payload_no_complexity = {
        "name": "Weak User",
        "email": "weak2@testfintech.com",
        "password": "simplepassword",
    }
    res_comp = client.post("/api/v1/auth/signup", json=payload_no_complexity)
    assert res_comp.status_code == 400
    assert "uppercase" in res_comp.json()["detail"].lower()


def test_login_flow(client: TestClient):
    """Test login with valid and invalid credentials."""
    # Valid login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "fatima@testfintech.com", "password": "FatimaPass2026!"},
    )
    assert res.status_code == 200
    assert "token" in res.json()

    # Invalid password
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "fatima@testfintech.com", "password": "WrongPassword!"},
    )
    assert res.status_code == 401

    # Non-existent user
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@testfintech.com", "password": "SomePassword123!"},
    )
    assert res.status_code == 401


def test_demo_login(client: TestClient):
    """Test demo user login yields a real valid session token in SQLite."""
    res = client.post("/api/v1/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["email"] == "ayesha@brightpixel.pk"
    token = data["token"]

    # Verify demo user can access demo business and transactions
    headers = {"Authorization": f"Bearer {token}"}
    tx_res = client.get("/api/v1/transactions", headers=headers)
    assert tx_res.status_code == 200
    assert len(tx_res.json()) > 0, "Demo user must have demo transactions"


def test_protected_routes_require_authentication(client: TestClient):
    """Protected endpoints must return 401 when accessed without a valid token."""
    endpoints = [
        "/api/v1/business",
        "/api/v1/user",
        "/api/v1/transactions",
        "/api/v1/invoices",
        "/api/v1/metrics",
        "/api/v1/health",
        "/api/v1/cashflow",
        "/api/v1/forecast",
        "/api/v1/notifications",
        "/api/v1/settings",
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401, f"Endpoint {ep} should require authentication"

    # With invalid token
    bad_headers = {"Authorization": "Bearer invalid-token-xyz"}
    res = client.get("/api/v1/transactions", headers=bad_headers)
    assert res.status_code == 401


def test_multi_tenant_data_isolation(client: TestClient):
    """Ensure User A and User B cannot access each other's financial records."""
    # Register User A (Alice)
    res_a = client.post(
        "/api/v1/auth/signup",
        json={"name": "Alice Studio", "email": "alice@studio.com", "password": "AlicePassword2026!"},
    )
    token_a = res_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B (Bob)
    res_b = client.post(
        "/api/v1/auth/signup",
        json={"name": "Bob Agency", "email": "bob@agency.com", "password": "BobPassword2026!"},
    )
    token_b = res_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Verify both start with clean, isolated ledgers (0 transactions)
    assert len(client.get("/api/v1/transactions", headers=headers_a).json()) == 0
    assert len(client.get("/api/v1/transactions", headers=headers_b).json()) == 0

    # Alice creates a private transaction
    create_res = client.post(
        "/api/v1/transactions",
        headers=headers_a,
        json={
            "date": "2026-04-15",
            "description": "Alice Confidential Brand Design",
            "category": "Client Retainer",
            "type": "income",
            "amount": 75000.0,
            "status": "completed",
            "notes": "Private client agreement",
        },
    )
    assert create_res.status_code == 201
    txn_a_id = create_res.json()["id"]

    # Alice sees her 1 transaction
    alice_txns = client.get("/api/v1/transactions", headers=headers_a).json()
    assert len(alice_txns) == 1
    assert alice_txns[0]["description"] == "Alice Confidential Brand Design"

    # Bob lists transactions — must see 0! (Isolated)
    bob_txns = client.get("/api/v1/transactions", headers=headers_b).json()
    assert len(bob_txns) == 0, "Bob must NOT see Alice's transactions"

    # Bob attempts to delete Alice's transaction — must return 404
    delete_res = client.delete(f"/api/v1/transactions/{txn_a_id}", headers=headers_b)
    assert delete_res.status_code == 404, "Bob must not be able to delete Alice's transaction"

    # Alice can delete her own transaction
    del_alice = client.delete(f"/api/v1/transactions/{txn_a_id}", headers=headers_a)
    assert del_alice.status_code == 200


def test_logout_and_session_expiry(client: TestClient):
    """Test that logout revokes the session and expired sessions are rejected."""
    # Login
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "fatima@testfintech.com", "password": "FatimaPass2026!"},
    )
    token = res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify token works
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200

    # Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

    # Re-accessing with revoked token returns 401
    me_after = client.get("/api/v1/auth/me", headers=headers)
    assert me_after.status_code == 401

    # Test expired token rejection
    expired_token = "expired-token-session-test"
    db_user = db_get_user_by_email("fatima@testfintech.com")
    past_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    db_create_session(db_user["id"], expired_token, expires_at=past_date)

    exp_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert exp_res.status_code == 401
    assert "expired" in exp_res.json()["detail"].lower()
