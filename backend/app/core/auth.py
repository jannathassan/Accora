"""FastAPI authentication dependencies and route protection."""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import db_delete_session, db_get_session, db_get_user_by_id
from app.core.security import is_expired
from app.models.financial import User

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> User:
    """Validate Bearer session token and return the authenticated User.
    
    Raises 401 Unauthorized if the token is missing, invalid, or expired.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    session = db_get_session(token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is invalid or has been logged out. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check expiration
    if is_expired(session["expires_at"]):
        db_delete_session(token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db_get_user_by_id(session["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this session no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> User | None:
    """Return the authenticated User if a valid Bearer session token is present; otherwise None."""
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    session = db_get_session(token)
    if not session:
        return None

    if is_expired(session["expires_at"]):
        db_delete_session(token)
        return None

    return db_get_user_by_id(session["user_id"])
