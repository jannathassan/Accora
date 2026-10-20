"""Rate limiting utility for sensitive authentication endpoints."""

from __future__ import annotations

import threading
import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    """Thread-safe sliding-window rate limiter for in-memory enforcement."""

    def __init__(self, default_limit: int = 10, window_seconds: float = 60.0):
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self._history: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def check(self, key: str, limit: int | None = None) -> bool:
        """Returns True if the request is permitted, False if rate limited."""
        max_reqs = limit if limit is not None else self.default_limit
        now = time.time()
        cutoff = now - self.window_seconds
        with self._lock:
            history = self._history[key]
            # Discard timestamps outside the sliding window
            valid = [t for t in history if t > cutoff]
            if len(valid) >= max_reqs:
                self._history[key] = valid
                return False
            valid.append(now)
            self._history[key] = valid
            return True

    def reset(self) -> None:
        """Clear all rate limit history (useful for automated testing)."""
        with self._lock:
            self._history.clear()


auth_rate_limiter = InMemoryRateLimiter(default_limit=10, window_seconds=60.0)


def get_client_ip(request: Request) -> str:
    """Extract client IP, inspecting X-Forwarded-For if behind a reverse proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # First IP in X-Forwarded-For is the originating client IP
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


def check_auth_rate_limit(request: Request) -> None:
    """FastAPI dependency to rate limit authentication endpoints."""
    ip = get_client_ip(request)
    endpoint = request.url.path
    key = f"{ip}:{endpoint}"
    if not auth_rate_limiter.check(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication requests. Please try again later.",
            headers={"Retry-After": "60"},
        )
