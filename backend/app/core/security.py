"""Security utilities for Accora: password hashing, verification, and session tokens.

Uses Python standard library hashlib (PBKDF2-HMAC-SHA256 with 600,000 iterations)
and secrets. Never logs passwords or stores plain-text credentials.
"""

from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone

# NIST SP 800-132 recommendation for PBKDF2-SHA256
PBKDF2_ITERATIONS = 600_000
SESSION_DURATION_DAYS = 7


def generate_salt() -> str:
    """Generate a cryptographically secure 32-byte hex salt."""
    return secrets.token_hex(32)


def hash_password(password: str, salt: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with per-user salt."""
    salt_bytes = bytes.fromhex(salt)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_bytes,
        PBKDF2_ITERATIONS,
    )
    return key.hex()


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Verify password against expected hash in constant time."""
    computed_hash = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, expected_hash)


def create_session_token() -> str:
    """Generate a high-entropy URL-safe session token."""
    return secrets.token_urlsafe(48)


def calculate_expiry(days: int = SESSION_DURATION_DAYS) -> str:
    """Calculate expiration ISO timestamp in UTC."""
    exp = datetime.now(timezone.utc) + timedelta(days=days)
    return exp.isoformat()


def is_expired(expiry_iso: str) -> bool:
    """Check if an ISO timestamp has passed."""
    try:
        # Handle trailing Z or timezone offset
        clean_iso = expiry_iso.replace("Z", "+00:00")
        exp = datetime.fromisoformat(clean_iso)
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) >= exp
    except Exception:
        return True


def validate_password_rules(password: str) -> list[str]:
    """Validate password against enterprise complexity standards.
    
    Rules:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special symbol
    """
    errors: list[str] = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")
    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one numerical digit.")
    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append("Password must contain at least one special symbol (e.g. !@#$%^&*).")
    return errors
