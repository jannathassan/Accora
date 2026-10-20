"""Authentication API routes: signup, login, demo-login, logout, and current user profile."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.auth import get_current_user, security_scheme
from app.core.database import (
    db_create_session,
    db_create_user,
    db_delete_session,
    db_get_user_by_email,
    db_get_user_by_id,
)
from app.core.security import (
    create_session_token,
    generate_salt,
    hash_password,
    validate_password_rules,
    verify_password,
)
from app.models.financial import User
from app.schemas.auth import (
    AuthResponse,
    AuthUser,
    LoginRequest,
    MessageResponse,
    SignupRequest,
)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account with isolated business workspace",
)
async def signup(req: SignupRequest) -> AuthResponse:
    # 1. Validate password complexity rules
    pw_errors = validate_password_rules(req.password)
    if pw_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(pw_errors),
        )

    # 2. Check if user already exists
    existing = db_get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in.",
        )

    # 3. Hash password securely with per-user salt (never log or store plaintext)
    salt = generate_salt()
    pw_hash = hash_password(req.password, salt)

    # 4. Create user record with a brand-new, isolated business
    user, _ = db_create_user(
        name=req.name,
        email=req.email,
        password_hash=pw_hash,
        salt=salt,
    )

    # 5. Generate secure session token and record in database
    token = create_session_token()
    expires_at = db_create_session(user.id, token)

    return AuthResponse(
        token=token,
        user=AuthUser(
            id=user.id,
            name=user.name,
            email=user.email,
            business_id=user.business_id,
            created_at=user.created_at,
        ),
        expires_at=expires_at,
    )


@auth_router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate with email and password",
)
async def login(req: LoginRequest) -> AuthResponse:
    # 1. Fetch user by email
    row = db_get_user_by_email(req.email)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Verify password in constant time
    if not verify_password(req.password, row["salt"], row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create expiring session token in SQLite
    user = db_get_user_by_id(row["id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User record could not be loaded.",
        )

    token = create_session_token()
    expires_at = db_create_session(user.id, token)

    return AuthResponse(
        token=token,
        user=AuthUser(
            id=user.id,
            name=user.name,
            email=user.email,
            business_id=user.business_id,
            created_at=user.created_at,
        ),
        expires_at=expires_at,
    )


@auth_router.post(
    "/demo-login",
    response_model=AuthResponse,
    summary="Authenticate as the demo user with real session token in SQLite",
)
async def demo_login() -> AuthResponse:
    demo_email = "ayesha@brightpixel.pk"
    row = db_get_user_by_email(demo_email)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user is not provisioned.",
        )

    user = db_get_user_by_id(row["id"])
    if not user:
        raise HTTPException(status_code=500, detail="Demo user could not be loaded.")

    token = create_session_token()
    expires_at = db_create_session(user.id, token)

    return AuthResponse(
        token=token,
        user=AuthUser(
            id=user.id,
            name=user.name,
            email=user.email,
            business_id=user.business_id,
            created_at=user.created_at,
        ),
        expires_at=expires_at,
    )


@auth_router.get(
    "/me",
    response_model=AuthUser,
    summary="Get profile of the currently authenticated user",
)
async def get_me(current_user: User = Depends(get_current_user)) -> AuthUser:
    return AuthUser(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        business_id=current_user.business_id,
        created_at=current_user.created_at,
    )


@auth_router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Invalidate active session token",
)
async def logout(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> MessageResponse:
    if credentials and credentials.credentials:
        db_delete_session(credentials.credentials)
    return MessageResponse(message="Successfully signed out.")
