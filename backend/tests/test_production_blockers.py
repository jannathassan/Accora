"""Automated test suite verifying fixes for production deployment blockers:
1. Conditional demo seeding and demo-login endpoint (disabled in production mode returning 404).
2. Normal signup and login functionality unaffected when demo mode is disabled.
3. Database absolute path support and clear failure without silent fallback on invalid/unwritable location.
4. CORS origin parsing for strings, comma-separated lists, and JSON arrays.
5. Rate limiting on sensitive authentication endpoints (signup, login, demo-login).
6. Debug mode disabled in production.
"""

from __future__ import annotations

import os
import sqlite3
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, settings
from app.core.database import (
    db_get_user_by_email,
    get_db,
    init_db,
)
from app.core.rate_limit import auth_rate_limiter
from app.main import app


@pytest.fixture(autouse=True)
def reset_rate_limits():
    """Ensure rate limiter state is fresh before and after every test."""
    auth_rate_limiter.reset()
    yield
    auth_rate_limiter.reset()


# ---------------------------------------------------------------------------
# 1. Secure Demo Login & Normal Auth in Production Mode
# ---------------------------------------------------------------------------

def test_demo_account_not_seeded_when_demo_mode_disabled():
    """When demo mode is disabled, init_db must NOT seed the demo user or demo business."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_demo = settings.demo_mode
    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        settings.demo_mode = False

        init_db(test_db, seed_demo=False)

        # Demo user should not exist
        demo_user = db_get_user_by_email("ayesha@brightpixel.pk", db_path=test_db)
        assert demo_user is None, "Demo account must NOT be seeded when demo mode is disabled"

        # Verify no demo business exists
        with get_db(test_db) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM businesses WHERE name LIKE '%BrightPixel%';")
            assert cursor.fetchone()[0] == 0, "Demo business must NOT exist"
    finally:
        settings.demo_mode = orig_demo
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


def test_demo_login_returns_404_when_demo_mode_disabled():
    """POST /api/v1/auth/demo-login must be unavailable (returning 404) when demo mode is disabled."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_demo = settings.demo_mode
    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        settings.demo_mode = False
        init_db(test_db, seed_demo=False)

        with TestClient(app) as client:
            res = client.post("/api/v1/auth/demo-login")
            assert res.status_code == 404
            data = res.json()
            assert "detail" in data
            assert "Demo login is disabled" in data["detail"]
    finally:
        settings.demo_mode = orig_demo
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


def test_normal_signup_and_login_work_in_production_mode():
    """In production mode (ACCORA_DEMO_MODE=false), normal registration and login must work perfectly."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_demo = settings.demo_mode
    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        settings.demo_mode = False
        init_db(test_db, seed_demo=False)

        with TestClient(app) as client:
            # 1. Normal signup
            signup_payload = {
                "name": "Production User",
                "email": "owner@realbusiness.com",
                "password": "ProductionPassword2026!",
            }
            signup_res = client.post("/api/v1/auth/signup", json=signup_payload)
            assert signup_res.status_code == 201, f"Signup failed: {signup_res.text}"
            data = signup_res.json()
            token = data["token"]
            assert data["user"]["email"] == "owner@realbusiness.com"

            # 2. Normal login with credentials
            login_payload = {
                "email": "owner@realbusiness.com",
                "password": "ProductionPassword2026!",
            }
            login_res = client.post("/api/v1/auth/login", json=login_payload)
            assert login_res.status_code == 200, f"Login failed: {login_res.text}"
            login_token = login_res.json()["token"]

            # 3. Access protected business resource
            headers = {"Authorization": f"Bearer {login_token}"}
            biz_res = client.get("/api/v1/business", headers=headers)
            assert biz_res.status_code == 200
            assert "Production User" in biz_res.json()["name"]

            # 4. Create and retrieve a transaction
            tx_res = client.post(
                "/api/v1/transactions",
                headers=headers,
                json={
                    "date": "2026-06-01",
                    "description": "First Production Revenue",
                    "category": "Sales",
                    "type": "income",
                    "amount": 12500.0,
                    "status": "completed",
                    "notes": "Verified in production mode",
                },
            )
            assert tx_res.status_code == 201

            tx_list = client.get("/api/v1/transactions", headers=headers)
            assert tx_list.status_code == 200
            assert len(tx_list.json()) == 1
    finally:
        settings.demo_mode = orig_demo
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


def test_demo_login_succeeds_when_demo_mode_enabled():
    """When demo mode is explicitly enabled, demo seeding and demo-login endpoint work."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_demo = settings.demo_mode
    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        settings.demo_mode = True
        init_db(test_db, seed_demo=True)

        with TestClient(app) as client:
            res = client.post("/api/v1/auth/demo-login")
            assert res.status_code == 200
            data = res.json()
            assert data["user"]["email"] == "ayesha@brightpixel.pk"
            assert "token" in data
    finally:
        settings.demo_mode = orig_demo
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# 2. Database Persistence & Path Failure Handling
# ---------------------------------------------------------------------------

def test_database_supports_absolute_path():
    """Database initialization must support an absolute persistent path."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        abs_path = os.path.abspath(f.name)

    orig_db = settings.database_path
    try:
        settings.database_path = abs_path
        init_db(abs_path, seed_demo=False)

        assert os.path.exists(abs_path), f"Database must exist at absolute path {abs_path}"

        with sqlite3.connect(abs_path) as conn:
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = {row[0] for row in cursor.fetchall()}
            assert "businesses" in tables
            assert "users" in tables
            assert "transactions" in tables
    finally:
        settings.database_path = orig_db
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
            except OSError:
                pass


def test_database_fails_clearly_without_silent_fallback():
    """If database path is unwritable or invalid, startup must raise RuntimeError with clear error."""
    # Use a path where a parent component is an existing file, making directory creation impossible
    with tempfile.NamedTemporaryFile(delete=False) as f:
        blocked_file = f.name

    try:
        invalid_path = Path(blocked_file) / "sub_folder" / "accora.db"

        with pytest.raises(RuntimeError) as exc_info:
            init_db(str(invalid_path), seed_demo=False)

        err_msg = str(exc_info.value).lower()
        assert (
            "cannot be created" in err_msg
            or "unavailable" in err_msg
            or "unable to connect" in err_msg
            or "database" in err_msg
        )
    finally:
        if os.path.exists(blocked_file):
            try:
                os.remove(blocked_file)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# 3. Production Hardening: CORS Parsing, Rate Limiting, Debug Mode
# ---------------------------------------------------------------------------

def test_cors_origins_parsing():
    """CORS origins must parse correctly from comma-separated string, JSON array, or list."""
    # Plain URL string
    s1 = Settings(cors_origins="https://accora.vercel.app")
    assert s1.cors_origins == ["https://accora.vercel.app"]

    # Comma-separated origins
    s2 = Settings(cors_origins="https://accora.vercel.app, http://localhost:5173")
    assert s2.cors_origins == ["https://accora.vercel.app", "http://localhost:5173"]

    # JSON array
    s3 = Settings(cors_origins='["https://accora.vercel.app", "https://preview.vercel.app"]')
    assert s3.cors_origins == ["https://accora.vercel.app", "https://preview.vercel.app"]

    # Python list
    s4 = Settings(cors_origins=["https://accora.vercel.app"])
    assert s4.cors_origins == ["https://accora.vercel.app"]

    # Empty string
    s5 = Settings(cors_origins="")
    assert s5.cors_origins == []


def test_rate_limiting_on_auth_endpoints():
    """Sensitive auth endpoints must rate limit repeated requests beyond the threshold."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        init_db(test_db, seed_demo=False)

        with TestClient(app) as client:
            auth_rate_limiter.reset()

            # Attempt 10 failed logins
            for _ in range(10):
                res = client.post(
                    "/api/v1/auth/login",
                    json={"email": "wrong@example.com", "password": "WrongPassword123!"},
                )
                assert res.status_code == 401

            # 11th attempt must be rate limited with 429
            res_limited = client.post(
                "/api/v1/auth/login",
                json={"email": "wrong@example.com", "password": "WrongPassword123!"},
            )
            assert res_limited.status_code == 429
            assert "Retry-After" in res_limited.headers
            assert "Too many authentication requests" in res_limited.json()["detail"]

            # After reset, requests should succeed (return 401 instead of 429)
            auth_rate_limiter.reset()
            res_after_reset = client.post(
                "/api/v1/auth/login",
                json={"email": "wrong@example.com", "password": "WrongPassword123!"},
            )
            assert res_after_reset.status_code == 401
    finally:
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


def test_rate_limiting_respects_forwarded_ip():
    """Rate limiter inspects X-Forwarded-For so distinct client IPs behind a proxy have isolated limits."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        test_db = f.name

    orig_db = settings.database_path
    try:
        settings.database_path = test_db
        init_db(test_db, seed_demo=False)

        with TestClient(app) as client:
            auth_rate_limiter.reset()

            # IP 1 uses up its 10 requests
            headers_ip1 = {"X-Forwarded-For": "198.51.100.1"}
            for _ in range(10):
                res = client.post(
                    "/api/v1/auth/login",
                    json={"email": "nobody@example.com", "password": "WrongPassword!"},
                    headers=headers_ip1,
                )
                assert res.status_code == 401

            # IP 1 is now rate limited
            res_ip1_blocked = client.post(
                "/api/v1/auth/login",
                json={"email": "nobody@example.com", "password": "WrongPassword!"},
                headers=headers_ip1,
            )
            assert res_ip1_blocked.status_code == 429

            # IP 2 should NOT be blocked
            headers_ip2 = {"X-Forwarded-For": "198.51.100.2"}
            res_ip2 = client.post(
                "/api/v1/auth/login",
                json={"email": "nobody@example.com", "password": "WrongPassword!"},
                headers=headers_ip2,
            )
            assert res_ip2.status_code == 401, "Distinct client IP must have its own rate limit budget"
    finally:
        settings.database_path = orig_db
        if os.path.exists(test_db):
            try:
                os.remove(test_db)
            except OSError:
                pass


def test_debug_mode_disabled_by_default():
    """Verify debug mode is disabled by default in settings and FastAPI instance."""
    default_settings = Settings()
    assert default_settings.debug is False, "Settings.debug must default to False for production safety"
    assert app.debug is False, "FastAPI app.debug must be False"
